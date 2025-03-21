{{/* vim: set filetype=mustache: */}}
{{/*
Environment variables for web and worker containers
*/}}
{{- define "deployment.envs" }}
env:
  - name: DB_NAME
    valueFrom:
      secretKeyRef:
        name: dps-rds-instance-output
        key: database_name

  - name: DB_SERVER
    valueFrom:
      secretKeyRef:
        name: dps-rds-instance-output
        key: rds_instance_address

  - name: DB_USER
    valueFrom:
      secretKeyRef:
        name: dps-rds-instance-output
        key: database_username

  - name: DB_PASS
    valueFrom:
      secretKeyRef:
        name: dps-rds-instance-output
        key: database_password

  - name: DB_SSL_ENABLED
    value: "true"

  - name: APPINSIGHTS_INSTRUMENTATIONKEY
    valueFrom:
      secretKeyRef:
        name: {{ template "app.name" . }}
        key: APPINSIGHTS_INSTRUMENTATIONKEY

  - name: SESSION_SECRET
    valueFrom:
      secretKeyRef:
        name: {{ template "app.name" . }}
        key: SESSION_SECRET

  - name: API_CLIENT_ID
    valueFrom:
      secretKeyRef:
        name: {{ template "app.name" . }}
        key: API_CLIENT_ID

  - name: API_CLIENT_SECRET
    valueFrom:
      secretKeyRef:
        name: {{ template "app.name" . }}
        key: API_CLIENT_SECRET

  - name: ADMIN_API_CLIENT_ID
    valueFrom:
      secretKeyRef:
        name: {{ template "app.name" . }}
        key: ADMIN_API_CLIENT_ID

  - name: ADMIN_API_CLIENT_SECRET
    valueFrom:
      secretKeyRef:
        name: {{ template "app.name" . }}
        key: ADMIN_API_CLIENT_SECRET

  - name: TAG_MANAGER_KEY
    valueFrom:
      secretKeyRef:
        name: {{ template "app.name" . }}
        key: TAG_MANAGER_KEY

  - name: NOTIFY_API_KEY
    valueFrom:
      secretKeyRef:
        name: {{ template "app.name" . }}
        key: NOTIFY_API_KEY

  - name: NOMIS_API_URL
    value: {{ .Values.env.NOMIS_API_URL | quote }}

  - name: NOMIS_AUTH_URL
    value: {{ .Values.env.NOMIS_AUTH_URL | quote }}

  - name: GLOBAL_SEARCH_URL
    value: {{ .Values.env.GLOBAL_SEARCH_URL | quote }}

  - name: PUSH_TO_NOMIS
    value: {{ .Values.env.PUSH_TO_NOMIS | quote }}

  - name: REMINDERS_SCHEDULE_RO
    value: {{ .Values.env.REMINDERS_SCHEDULE_RO | quote }}

  - name: SCHEDULED_JOBS_AUTOSTART
    value: {{ .Values.env.SCHEDULED_JOBS_AUTOSTART | quote }}

  - name: SCHEDULED_JOBS_OVERLAP
    value: {{ .Values.env.SCHEDULED_JOBS_OVERLAP | quote }}

  - name: NOTIFY_ACTIVE_TEMPLATES
    value: {{ .Values.env.NOTIFY_ACTIVE_TEMPLATES | quote }}

  - name: DELIUS_API_URL
    value: {{ .Values.env.DELIUS_API_URL | quote }}

  - name: PROBATION_TEAMS_API_URL
    value: {{ .Values.env.PROBATION_TEAMS_API_URL | quote }}

  - name: PROBATION_SEARCH_API_URL
    value: {{ .Values.env.PROBATION_SEARCH_API_URL | quote }}

  - name: PRISONER_SEARCH_API_URL
    value: {{ .Values.env.PRISONER_SEARCH_API_URL | quote }}

  - name: MANAGE_USERS_API_URL
    value: {{ .Values.env.MANAGE_USERS_API_URL | quote }}

  - name: EXIT_LOCATION_URL
    value: {{ .Values.env.EXIT_LOCATION_URL | quote }}

  - name: TOKENVERIFICATION_API_URL
    value: {{ .Values.env.TOKENVERIFICATION_API_URL | quote }}

  - name: TOKENVERIFICATION_API_ENABLED
    value: {{ .Values.env.TOKENVERIFICATION_API_ENABLED | quote }}

  - name: FEEDBACK_SUPPORT_URL
    value: {{ .Values.env.FEEDBACK_SUPPORT_URL | quote }}

  - name: NODE_ENV
    value: production

  - name: DOMAIN
    value: https://{{ .Values.ingress.host }}

  - name: REDIS_HOST
    valueFrom:
      secretKeyRef:
        name: licences-elasticache-redis
        key: primary_endpoint_address

  - name: REDIS_AUTH_TOKEN
    valueFrom:
      secretKeyRef:
        name: licences-elasticache-redis
        key: auth_token

  - name: REDIS_TLS_ENABLED
    value: "true"

  - name: HDC_URL
    value: "http://licences:80"

  - name: GOTENBERG_API_URL
    value: "http://licences-gotenberg:3000"

  - name: LICENCE_RISK_MANAGEMENT_VERSION
    value: {{ .Values.env.LICENCE_RISK_MANAGEMENT_VERSION | quote }}

  - name: CURFEW_ADDRESS_REVIEW_VERSION
    value: {{ .Values.env.CURFEW_ADDRESS_REVIEW_VERSION | quote }}
  
  - name: COM_NOT_ALLOCATED_BLOCK_ENABLED
    value: {{ .Values.env.COM_NOT_ALLOCATED_BLOCK_ENABLED | quote }}
  
  - name: CA_REPORTS_LINK_ENABLED
    value: {{ .Values.env.CA_REPORTS_LINK_ENABLED | quote }}
{{- end -}}
