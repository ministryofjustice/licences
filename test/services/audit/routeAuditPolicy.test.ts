import express from 'express'
import getAuditPolicy, { AuditPolicy } from '../../../server/services/audit/routeAuditPolicy'
import routeAuditPolicy from '../../../server/services/audit/auditPolicyConfig.json'
import setupRoutes from '../../../server/routes'
import { Services } from '../../../server/services'

interface RouteEntry {
  method: string
  path: string
  key: string
}

function joinPaths(prefix: string, routePath: string): string {
  const left = prefix === '/' ? '' : prefix.replace(/\/+$/, '')
  let right = routePath
  if (routePath === '/') {
    right = ''
  } else if (!routePath.startsWith('/')) {
    right = `/${routePath}`
  }
  return `${left}${right}` || '/'
}

function extractRoutes(layer: any, prefix = '', routes: RouteEntry[] = []): RouteEntry[] {
  if (layer.name === 'router' && layer.handle.stack) {
    const mountPaths: string[] = layer.mountPaths ?? ['']
    layer.handle.stack.forEach((sublayer: any) => {
      mountPaths.forEach((mountPath) => extractRoutes(sublayer, joinPaths(prefix, mountPath), routes))
    })
    return routes
  }

  if (layer.route) {
    const methods = Object.keys(layer.route.methods).map((method) => method.toUpperCase())
    const routePaths: string[] = Array.isArray(layer.route.path) ? layer.route.path : [layer.route.path || '']

    methods.forEach((method) => {
      routePaths.forEach((routePath) => {
        const path = joinPaths(prefix, routePath)
        routes.push({method, path, key: `${method} ${path}`})
      })
    })
  }

  return routes
}

function setupRoutesWithMountPaths(services: Services): ReturnType<typeof setupRoutes> {
  const routerConstructor = express.Router as any
  const originalUse = routerConstructor.prototype.use

  routerConstructor.prototype.use = function patchedUse(this: any, ...args: any[]) {
    const stackLength = this.stack.length
    const firstArgument = args[0]
    let mountPaths: string[] = ['']
    if (typeof firstArgument === 'string') {
      mountPaths = [firstArgument]
    } else if (Array.isArray(firstArgument)) {
      mountPaths = firstArgument
    }
    const result = originalUse.apply(this, args)

    this.stack.slice(stackLength).forEach((layer: any) => {
      if (layer.name === 'router' && layer.handle.stack) {
        Object.assign(layer, {mountPaths})
      }
    })

    return result
  }

  try {
    return setupRoutes(services)
  } finally {
    routerConstructor.prototype.use = originalUse
  }
}

/**
 * Routes to exclude from audit policy checks.
 */
const excludedRoutes = new Set([
])

describe('Route Audit Policy', () => {
  let router: ReturnType<typeof setupRoutes>

  beforeEach(() => {
    router = setupRoutesWithMountPaths({} as Services)
  })

  it('every route must have an audit policy configured', () => {
    const allRoutes: RouteEntry[] = []

    router.stack.forEach((layer: any) => {
      extractRoutes(layer, '', allRoutes)
    })

    const missingPolicyEntries = allRoutes.filter((route) => {
      return !excludedRoutes.has(route.key) && !Object.keys(routeAuditPolicy).find((routeKey) => routeKey === route.key)
    })

    expect(missingPolicyEntries).toEqual([])
  })

  it('policy should not reference routes that do not exist', () => {
    const allRoutes = new Set<string>()

    router.stack.forEach((layer: any) => {
      const routes: RouteEntry[] = []
      extractRoutes(layer, '', routes)
      routes.forEach((r) => allRoutes.add(r.key))
    })

    const orphanedPolicies = Object.keys(routeAuditPolicy).filter(
      (policyKey) => !allRoutes.has(policyKey) && !excludedRoutes.has(policyKey),
    )

    expect(orphanedPolicies).toEqual([])
  })

  it('verify policy structure is valid', () => {
    Object.entries(routeAuditPolicy).forEach(([, policy]: [string, AuditPolicy]) => {
      if (policy.audit) {
        expect(policy.eventType).toBeDefined()
        expect(typeof policy.eventType).toBe('string')
        expect(policy.eventType.length).toBeGreaterThan(0)
      } else {
        expect(policy.reason).toBeDefined()
        expect(typeof policy.reason).toBe('string')
        expect(policy.reason.length).toBeGreaterThan(0)
      }
    })
  })

  it('policy config should not have duplicate keys', () => {
    const keys = Object.keys(routeAuditPolicy)
    const uniqueKeys = new Set(keys)
    expect(uniqueKeys.size).toBe(keys.length)
  })

  it('should match routes', () => {
    const validRoute = 'POST /hdc/risk/riskManagement/123'
    expect(getAuditPolicy(validRoute)).toBeDefined()

    const inValidRoute = 'POST /hdc/risk/invalid/123'
    expect(getAuditPolicy(inValidRoute)).not.toBeDefined()
  })
})
