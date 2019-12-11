export interface Role {
  roleCode: string
}

export interface Profile {
  username: string
  active: boolean
  name: string
  authSource: string
  staffId?: bigint
  activeCaseloadId?: string
  userId?: string
}
