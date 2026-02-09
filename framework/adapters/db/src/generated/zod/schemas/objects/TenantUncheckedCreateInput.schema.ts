import * as z from 'zod';
import type { Prisma } from '@prisma/client';
import { addressUncheckedCreateNestedManyWithoutTenantInputObjectSchema as addressUncheckedCreateNestedManyWithoutTenantInputObjectSchema } from './addressUncheckedCreateNestedManyWithoutTenantInput.schema';
import { address_linkUncheckedCreateNestedManyWithoutTenantInputObjectSchema as address_linkUncheckedCreateNestedManyWithoutTenantInputObjectSchema } from './address_linkUncheckedCreateNestedManyWithoutTenantInput.schema';
import { approval_commentUncheckedCreateNestedManyWithoutTenantInputObjectSchema as approval_commentUncheckedCreateNestedManyWithoutTenantInputObjectSchema } from './approval_commentUncheckedCreateNestedManyWithoutTenantInput.schema';
import { approval_definitionUncheckedCreateNestedManyWithoutTenantInputObjectSchema as approval_definitionUncheckedCreateNestedManyWithoutTenantInputObjectSchema } from './approval_definitionUncheckedCreateNestedManyWithoutTenantInput.schema';
import { approval_instanceUncheckedCreateNestedManyWithoutTenantInputObjectSchema as approval_instanceUncheckedCreateNestedManyWithoutTenantInputObjectSchema } from './approval_instanceUncheckedCreateNestedManyWithoutTenantInput.schema';
import { approval_taskUncheckedCreateNestedManyWithoutTenantInputObjectSchema as approval_taskUncheckedCreateNestedManyWithoutTenantInputObjectSchema } from './approval_taskUncheckedCreateNestedManyWithoutTenantInput.schema';
import { attachmentUncheckedCreateNestedManyWithoutTenantInputObjectSchema as attachmentUncheckedCreateNestedManyWithoutTenantInputObjectSchema } from './attachmentUncheckedCreateNestedManyWithoutTenantInput.schema';
import { audit_logUncheckedCreateNestedManyWithoutTenantInputObjectSchema as audit_logUncheckedCreateNestedManyWithoutTenantInputObjectSchema } from './audit_logUncheckedCreateNestedManyWithoutTenantInput.schema';
import { contact_phoneUncheckedCreateNestedManyWithoutTenantInputObjectSchema as contact_phoneUncheckedCreateNestedManyWithoutTenantInputObjectSchema } from './contact_phoneUncheckedCreateNestedManyWithoutTenantInput.schema';
import { contact_pointUncheckedCreateNestedManyWithoutTenantInputObjectSchema as contact_pointUncheckedCreateNestedManyWithoutTenantInputObjectSchema } from './contact_pointUncheckedCreateNestedManyWithoutTenantInput.schema';
import { documentUncheckedCreateNestedManyWithoutTenantInputObjectSchema as documentUncheckedCreateNestedManyWithoutTenantInputObjectSchema } from './documentUncheckedCreateNestedManyWithoutTenantInput.schema';
import { email_otp_instanceUncheckedCreateNestedManyWithoutTenantInputObjectSchema as email_otp_instanceUncheckedCreateNestedManyWithoutTenantInputObjectSchema } from './email_otp_instanceUncheckedCreateNestedManyWithoutTenantInput.schema';
import { entitlementUncheckedCreateNestedManyWithoutTenantInputObjectSchema as entitlementUncheckedCreateNestedManyWithoutTenantInputObjectSchema } from './entitlementUncheckedCreateNestedManyWithoutTenantInput.schema';
import { entity_tagUncheckedCreateNestedManyWithoutTenantInputObjectSchema as entity_tagUncheckedCreateNestedManyWithoutTenantInputObjectSchema } from './entity_tagUncheckedCreateNestedManyWithoutTenantInput.schema';
import { feature_flagUncheckedCreateNestedManyWithoutTenantInputObjectSchema as feature_flagUncheckedCreateNestedManyWithoutTenantInputObjectSchema } from './feature_flagUncheckedCreateNestedManyWithoutTenantInput.schema';
import { field_access_logUncheckedCreateNestedManyWithoutTenantInputObjectSchema as field_access_logUncheckedCreateNestedManyWithoutTenantInputObjectSchema } from './field_access_logUncheckedCreateNestedManyWithoutTenantInput.schema';
import { GroupMemberUncheckedCreateNestedManyWithoutTenantInputObjectSchema as GroupMemberUncheckedCreateNestedManyWithoutTenantInputObjectSchema } from './GroupMemberUncheckedCreateNestedManyWithoutTenantInput.schema';
import { IdpIdentityUncheckedCreateNestedManyWithoutTenantInputObjectSchema as IdpIdentityUncheckedCreateNestedManyWithoutTenantInputObjectSchema } from './IdpIdentityUncheckedCreateNestedManyWithoutTenantInput.schema';
import { jobUncheckedCreateNestedManyWithoutTenantInputObjectSchema as jobUncheckedCreateNestedManyWithoutTenantInputObjectSchema } from './jobUncheckedCreateNestedManyWithoutTenantInput.schema';
import { job_runUncheckedCreateNestedManyWithoutTenantInputObjectSchema as job_runUncheckedCreateNestedManyWithoutTenantInputObjectSchema } from './job_runUncheckedCreateNestedManyWithoutTenantInput.schema';
import { core_lifecycleUncheckedCreateNestedManyWithoutTenantInputObjectSchema as core_lifecycleUncheckedCreateNestedManyWithoutTenantInputObjectSchema } from './core_lifecycleUncheckedCreateNestedManyWithoutTenantInput.schema';
import { lifecycle_versionUncheckedCreateNestedManyWithoutTenantInputObjectSchema as lifecycle_versionUncheckedCreateNestedManyWithoutTenantInputObjectSchema } from './lifecycle_versionUncheckedCreateNestedManyWithoutTenantInput.schema';
import { mfa_challengeUncheckedCreateNestedManyWithoutTenantInputObjectSchema as mfa_challengeUncheckedCreateNestedManyWithoutTenantInputObjectSchema } from './mfa_challengeUncheckedCreateNestedManyWithoutTenantInput.schema';
import { mfa_configUncheckedCreateNestedManyWithoutTenantInputObjectSchema as mfa_configUncheckedCreateNestedManyWithoutTenantInputObjectSchema } from './mfa_configUncheckedCreateNestedManyWithoutTenantInput.schema';
import { organizational_unitUncheckedCreateNestedManyWithoutTenantInputObjectSchema as organizational_unitUncheckedCreateNestedManyWithoutTenantInputObjectSchema } from './organizational_unitUncheckedCreateNestedManyWithoutTenantInput.schema';
import { outboxUncheckedCreateNestedManyWithoutTenantInputObjectSchema as outboxUncheckedCreateNestedManyWithoutTenantInputObjectSchema } from './outboxUncheckedCreateNestedManyWithoutTenantInput.schema';
import { password_historyUncheckedCreateNestedManyWithoutTenantInputObjectSchema as password_historyUncheckedCreateNestedManyWithoutTenantInputObjectSchema } from './password_historyUncheckedCreateNestedManyWithoutTenantInput.schema';
import { PermissionDecisionLogUncheckedCreateNestedManyWithoutTenantInputObjectSchema as PermissionDecisionLogUncheckedCreateNestedManyWithoutTenantInputObjectSchema } from './PermissionDecisionLogUncheckedCreateNestedManyWithoutTenantInput.schema';
import { PrincipalUncheckedCreateNestedManyWithoutTenantInputObjectSchema as PrincipalUncheckedCreateNestedManyWithoutTenantInputObjectSchema } from './PrincipalUncheckedCreateNestedManyWithoutTenantInput.schema';
import { principal_groupUncheckedCreateNestedManyWithoutTenantInputObjectSchema as principal_groupUncheckedCreateNestedManyWithoutTenantInputObjectSchema } from './principal_groupUncheckedCreateNestedManyWithoutTenantInput.schema';
import { principal_locale_overrideUncheckedCreateNestedManyWithoutTenantInputObjectSchema as principal_locale_overrideUncheckedCreateNestedManyWithoutTenantInputObjectSchema } from './principal_locale_overrideUncheckedCreateNestedManyWithoutTenantInput.schema';
import { principal_ouUncheckedCreateNestedManyWithoutTenantInputObjectSchema as principal_ouUncheckedCreateNestedManyWithoutTenantInputObjectSchema } from './principal_ouUncheckedCreateNestedManyWithoutTenantInput.schema';
import { PrincipalProfileUncheckedCreateNestedManyWithoutTenantInputObjectSchema as PrincipalProfileUncheckedCreateNestedManyWithoutTenantInputObjectSchema } from './PrincipalProfileUncheckedCreateNestedManyWithoutTenantInput.schema';
import { principal_roleUncheckedCreateNestedManyWithoutTenantInputObjectSchema as principal_roleUncheckedCreateNestedManyWithoutTenantInputObjectSchema } from './principal_roleUncheckedCreateNestedManyWithoutTenantInput.schema';
import { principal_workspace_accessUncheckedCreateNestedManyWithoutTenantInputObjectSchema as principal_workspace_accessUncheckedCreateNestedManyWithoutTenantInputObjectSchema } from './principal_workspace_accessUncheckedCreateNestedManyWithoutTenantInput.schema';
import { RoleUncheckedCreateNestedManyWithoutTenantInputObjectSchema as RoleUncheckedCreateNestedManyWithoutTenantInputObjectSchema } from './RoleUncheckedCreateNestedManyWithoutTenantInput.schema';
import { security_eventUncheckedCreateNestedManyWithoutTenantInputObjectSchema as security_eventUncheckedCreateNestedManyWithoutTenantInputObjectSchema } from './security_eventUncheckedCreateNestedManyWithoutTenantInput.schema';
import { sms_otp_instanceUncheckedCreateNestedManyWithoutTenantInputObjectSchema as sms_otp_instanceUncheckedCreateNestedManyWithoutTenantInputObjectSchema } from './sms_otp_instanceUncheckedCreateNestedManyWithoutTenantInput.schema';
import { system_configUncheckedCreateNestedManyWithoutTenantInputObjectSchema as system_configUncheckedCreateNestedManyWithoutTenantInputObjectSchema } from './system_configUncheckedCreateNestedManyWithoutTenantInput.schema';
import { tenant_locale_policyUncheckedCreateNestedManyWithoutTenantInputObjectSchema as tenant_locale_policyUncheckedCreateNestedManyWithoutTenantInputObjectSchema } from './tenant_locale_policyUncheckedCreateNestedManyWithoutTenantInput.schema';
import { tenant_module_subscriptionUncheckedCreateNestedManyWithoutTenantInputObjectSchema as tenant_module_subscriptionUncheckedCreateNestedManyWithoutTenantInputObjectSchema } from './tenant_module_subscriptionUncheckedCreateNestedManyWithoutTenantInput.schema';
import { TenantProfileUncheckedCreateNestedOneWithoutTenantInputObjectSchema as TenantProfileUncheckedCreateNestedOneWithoutTenantInputObjectSchema } from './TenantProfileUncheckedCreateNestedOneWithoutTenantInput.schema';
import { totp_instanceUncheckedCreateNestedManyWithoutTenantInputObjectSchema as totp_instanceUncheckedCreateNestedManyWithoutTenantInputObjectSchema } from './totp_instanceUncheckedCreateNestedManyWithoutTenantInput.schema';
import { trusted_deviceUncheckedCreateNestedManyWithoutTenantInputObjectSchema as trusted_deviceUncheckedCreateNestedManyWithoutTenantInputObjectSchema } from './trusted_deviceUncheckedCreateNestedManyWithoutTenantInput.schema';
import { webauthn_credentialUncheckedCreateNestedManyWithoutTenantInputObjectSchema as webauthn_credentialUncheckedCreateNestedManyWithoutTenantInputObjectSchema } from './webauthn_credentialUncheckedCreateNestedManyWithoutTenantInput.schema';
import { workflow_instanceUncheckedCreateNestedManyWithoutTenantInputObjectSchema as workflow_instanceUncheckedCreateNestedManyWithoutTenantInputObjectSchema } from './workflow_instanceUncheckedCreateNestedManyWithoutTenantInput.schema';
import { workflow_transitionUncheckedCreateNestedManyWithoutTenantInputObjectSchema as workflow_transitionUncheckedCreateNestedManyWithoutTenantInputObjectSchema } from './workflow_transitionUncheckedCreateNestedManyWithoutTenantInput.schema';
import { workspace_featureUncheckedCreateNestedManyWithoutTenantInputObjectSchema as workspace_featureUncheckedCreateNestedManyWithoutTenantInputObjectSchema } from './workspace_featureUncheckedCreateNestedManyWithoutTenantInput.schema';
import { workspace_usage_metricUncheckedCreateNestedManyWithoutTenantInputObjectSchema as workspace_usage_metricUncheckedCreateNestedManyWithoutTenantInputObjectSchema } from './workspace_usage_metricUncheckedCreateNestedManyWithoutTenantInput.schema';
import { approval_sla_policyUncheckedCreateNestedManyWithoutTenantInputObjectSchema as approval_sla_policyUncheckedCreateNestedManyWithoutTenantInputObjectSchema } from './approval_sla_policyUncheckedCreateNestedManyWithoutTenantInput.schema';
import { approval_templateUncheckedCreateNestedManyWithoutTenantInputObjectSchema as approval_templateUncheckedCreateNestedManyWithoutTenantInputObjectSchema } from './approval_templateUncheckedCreateNestedManyWithoutTenantInput.schema';
import { approval_template_ruleUncheckedCreateNestedManyWithoutTenantInputObjectSchema as approval_template_ruleUncheckedCreateNestedManyWithoutTenantInputObjectSchema } from './approval_template_ruleUncheckedCreateNestedManyWithoutTenantInput.schema';
import { approval_template_stageUncheckedCreateNestedManyWithoutTenantInputObjectSchema as approval_template_stageUncheckedCreateNestedManyWithoutTenantInputObjectSchema } from './approval_template_stageUncheckedCreateNestedManyWithoutTenantInput.schema';
import { entityUncheckedCreateNestedManyWithoutTenantInputObjectSchema as entityUncheckedCreateNestedManyWithoutTenantInputObjectSchema } from './entityUncheckedCreateNestedManyWithoutTenantInput.schema';
import { entity_compiledUncheckedCreateNestedManyWithoutTenantInputObjectSchema as entity_compiledUncheckedCreateNestedManyWithoutTenantInputObjectSchema } from './entity_compiledUncheckedCreateNestedManyWithoutTenantInput.schema';
import { entity_compiled_overlayUncheckedCreateNestedManyWithoutTenantInputObjectSchema as entity_compiled_overlayUncheckedCreateNestedManyWithoutTenantInputObjectSchema } from './entity_compiled_overlayUncheckedCreateNestedManyWithoutTenantInput.schema';
import { entity_lifecycleUncheckedCreateNestedManyWithoutTenantInputObjectSchema as entity_lifecycleUncheckedCreateNestedManyWithoutTenantInputObjectSchema } from './entity_lifecycleUncheckedCreateNestedManyWithoutTenantInput.schema';
import { entity_lifecycle_route_compiledUncheckedCreateNestedManyWithoutTenantInputObjectSchema as entity_lifecycle_route_compiledUncheckedCreateNestedManyWithoutTenantInputObjectSchema } from './entity_lifecycle_route_compiledUncheckedCreateNestedManyWithoutTenantInput.schema';
import { entity_policyUncheckedCreateNestedManyWithoutTenantInputObjectSchema as entity_policyUncheckedCreateNestedManyWithoutTenantInputObjectSchema } from './entity_policyUncheckedCreateNestedManyWithoutTenantInput.schema';
import { entity_versionUncheckedCreateNestedManyWithoutTenantInputObjectSchema as entity_versionUncheckedCreateNestedManyWithoutTenantInputObjectSchema } from './entity_versionUncheckedCreateNestedManyWithoutTenantInput.schema';
import { fieldUncheckedCreateNestedManyWithoutTenantInputObjectSchema as fieldUncheckedCreateNestedManyWithoutTenantInputObjectSchema } from './fieldUncheckedCreateNestedManyWithoutTenantInput.schema';
import { field_security_policyUncheckedCreateNestedManyWithoutTenantInputObjectSchema as field_security_policyUncheckedCreateNestedManyWithoutTenantInputObjectSchema } from './field_security_policyUncheckedCreateNestedManyWithoutTenantInput.schema';
import { index_defUncheckedCreateNestedManyWithoutTenantInputObjectSchema as index_defUncheckedCreateNestedManyWithoutTenantInputObjectSchema } from './index_defUncheckedCreateNestedManyWithoutTenantInput.schema';
import { meta_lifecycleUncheckedCreateNestedManyWithoutTenantInputObjectSchema as meta_lifecycleUncheckedCreateNestedManyWithoutTenantInputObjectSchema } from './meta_lifecycleUncheckedCreateNestedManyWithoutTenantInput.schema';
import { lifecycle_stateUncheckedCreateNestedManyWithoutTenantInputObjectSchema as lifecycle_stateUncheckedCreateNestedManyWithoutTenantInputObjectSchema } from './lifecycle_stateUncheckedCreateNestedManyWithoutTenantInput.schema';
import { lifecycle_timer_policyUncheckedCreateNestedManyWithoutTenantInputObjectSchema as lifecycle_timer_policyUncheckedCreateNestedManyWithoutTenantInputObjectSchema } from './lifecycle_timer_policyUncheckedCreateNestedManyWithoutTenantInput.schema';
import { lifecycle_transitionUncheckedCreateNestedManyWithoutTenantInputObjectSchema as lifecycle_transitionUncheckedCreateNestedManyWithoutTenantInputObjectSchema } from './lifecycle_transitionUncheckedCreateNestedManyWithoutTenantInput.schema';
import { lifecycle_transition_gateUncheckedCreateNestedManyWithoutTenantInputObjectSchema as lifecycle_transition_gateUncheckedCreateNestedManyWithoutTenantInputObjectSchema } from './lifecycle_transition_gateUncheckedCreateNestedManyWithoutTenantInput.schema';
import { overlayUncheckedCreateNestedManyWithoutTenantInputObjectSchema as overlayUncheckedCreateNestedManyWithoutTenantInputObjectSchema } from './overlayUncheckedCreateNestedManyWithoutTenantInput.schema';
import { overlay_changeUncheckedCreateNestedManyWithoutTenantInputObjectSchema as overlay_changeUncheckedCreateNestedManyWithoutTenantInputObjectSchema } from './overlay_changeUncheckedCreateNestedManyWithoutTenantInput.schema';
import { PermissionPolicyUncheckedCreateNestedManyWithoutTenantInputObjectSchema as PermissionPolicyUncheckedCreateNestedManyWithoutTenantInputObjectSchema } from './PermissionPolicyUncheckedCreateNestedManyWithoutTenantInput.schema';
import { PermissionPolicyCompiledUncheckedCreateNestedManyWithoutTenantInputObjectSchema as PermissionPolicyCompiledUncheckedCreateNestedManyWithoutTenantInputObjectSchema } from './PermissionPolicyCompiledUncheckedCreateNestedManyWithoutTenantInput.schema';
import { PermissionPolicyVersionUncheckedCreateNestedManyWithoutTenantInputObjectSchema as PermissionPolicyVersionUncheckedCreateNestedManyWithoutTenantInputObjectSchema } from './PermissionPolicyVersionUncheckedCreateNestedManyWithoutTenantInput.schema';
import { PermissionRuleUncheckedCreateNestedManyWithoutTenantInputObjectSchema as PermissionRuleUncheckedCreateNestedManyWithoutTenantInputObjectSchema } from './PermissionRuleUncheckedCreateNestedManyWithoutTenantInput.schema';
import { PermissionRuleOperationUncheckedCreateNestedManyWithoutTenantInputObjectSchema as PermissionRuleOperationUncheckedCreateNestedManyWithoutTenantInputObjectSchema } from './PermissionRuleOperationUncheckedCreateNestedManyWithoutTenantInput.schema';
import { relationUncheckedCreateNestedManyWithoutTenantInputObjectSchema as relationUncheckedCreateNestedManyWithoutTenantInputObjectSchema } from './relationUncheckedCreateNestedManyWithoutTenantInput.schema';
import { dashboard_widgetUncheckedCreateNestedManyWithoutTenantInputObjectSchema as dashboard_widgetUncheckedCreateNestedManyWithoutTenantInputObjectSchema } from './dashboard_widgetUncheckedCreateNestedManyWithoutTenantInput.schema';
import { notificationUncheckedCreateNestedManyWithoutTenantInputObjectSchema as notificationUncheckedCreateNestedManyWithoutTenantInputObjectSchema } from './notificationUncheckedCreateNestedManyWithoutTenantInput.schema';
import { notification_preferenceUncheckedCreateNestedManyWithoutTenantInputObjectSchema as notification_preferenceUncheckedCreateNestedManyWithoutTenantInputObjectSchema } from './notification_preferenceUncheckedCreateNestedManyWithoutTenantInput.schema';
import { recent_activityUncheckedCreateNestedManyWithoutTenantInputObjectSchema as recent_activityUncheckedCreateNestedManyWithoutTenantInputObjectSchema } from './recent_activityUncheckedCreateNestedManyWithoutTenantInput.schema';
import { saved_viewUncheckedCreateNestedManyWithoutTenantInputObjectSchema as saved_viewUncheckedCreateNestedManyWithoutTenantInputObjectSchema } from './saved_viewUncheckedCreateNestedManyWithoutTenantInput.schema';
import { search_historyUncheckedCreateNestedManyWithoutTenantInputObjectSchema as search_historyUncheckedCreateNestedManyWithoutTenantInputObjectSchema } from './search_historyUncheckedCreateNestedManyWithoutTenantInput.schema';
import { user_preferenceUncheckedCreateNestedManyWithoutTenantInputObjectSchema as user_preferenceUncheckedCreateNestedManyWithoutTenantInputObjectSchema } from './user_preferenceUncheckedCreateNestedManyWithoutTenantInput.schema'

const makeSchema = () => z.object({
  id: z.string().optional(),
  code: z.string(),
  name: z.string(),
  display_name: z.string(),
  realm_key: z.string().optional(),
  status: z.string().optional(),
  region: z.string().optional().nullable(),
  subscription: z.string().optional(),
  createdAt: z.coerce.date().optional(),
  createdBy: z.string(),
  updatedAt: z.coerce.date().optional().nullable(),
  updatedBy: z.string().optional().nullable(),
  address: z.lazy(() => addressUncheckedCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  address_link: z.lazy(() => address_linkUncheckedCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  approval_comment: z.lazy(() => approval_commentUncheckedCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  approval_definition: z.lazy(() => approval_definitionUncheckedCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  approval_instance: z.lazy(() => approval_instanceUncheckedCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  approval_task: z.lazy(() => approval_taskUncheckedCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  attachment: z.lazy(() => attachmentUncheckedCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  audit_log: z.lazy(() => audit_logUncheckedCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  contact_phone: z.lazy(() => contact_phoneUncheckedCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  contact_point: z.lazy(() => contact_pointUncheckedCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  document: z.lazy(() => documentUncheckedCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  email_otp_instance: z.lazy(() => email_otp_instanceUncheckedCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  entitlement: z.lazy(() => entitlementUncheckedCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  entity_tag: z.lazy(() => entity_tagUncheckedCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  feature_flag: z.lazy(() => feature_flagUncheckedCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  field_access_log: z.lazy(() => field_access_logUncheckedCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  groupMembers: z.lazy(() => GroupMemberUncheckedCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  idpIdentities: z.lazy(() => IdpIdentityUncheckedCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  job: z.lazy(() => jobUncheckedCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  job_run: z.lazy(() => job_runUncheckedCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  lifecycle: z.lazy(() => core_lifecycleUncheckedCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  lifecycle_version: z.lazy(() => lifecycle_versionUncheckedCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  mfa_challenge: z.lazy(() => mfa_challengeUncheckedCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  mfa_config: z.lazy(() => mfa_configUncheckedCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  organizational_unit: z.lazy(() => organizational_unitUncheckedCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  outbox: z.lazy(() => outboxUncheckedCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  password_history: z.lazy(() => password_historyUncheckedCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  permission_decision_log: z.lazy(() => PermissionDecisionLogUncheckedCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  principals: z.lazy(() => PrincipalUncheckedCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  principal_group: z.lazy(() => principal_groupUncheckedCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  principal_locale_override: z.lazy(() => principal_locale_overrideUncheckedCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  principal_ou: z.lazy(() => principal_ouUncheckedCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  principalProfiles: z.lazy(() => PrincipalProfileUncheckedCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  principal_role: z.lazy(() => principal_roleUncheckedCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  principal_workspace_access: z.lazy(() => principal_workspace_accessUncheckedCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  roles: z.lazy(() => RoleUncheckedCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  security_event: z.lazy(() => security_eventUncheckedCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  sms_otp_instance: z.lazy(() => sms_otp_instanceUncheckedCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  system_config: z.lazy(() => system_configUncheckedCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  tenant_locale_policy: z.lazy(() => tenant_locale_policyUncheckedCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  tenant_module_subscription: z.lazy(() => tenant_module_subscriptionUncheckedCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  tenantProfile: z.lazy(() => TenantProfileUncheckedCreateNestedOneWithoutTenantInputObjectSchema).optional(),
  totp_instance: z.lazy(() => totp_instanceUncheckedCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  trusted_device: z.lazy(() => trusted_deviceUncheckedCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  webauthn_credential: z.lazy(() => webauthn_credentialUncheckedCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  workflow_instance: z.lazy(() => workflow_instanceUncheckedCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  workflow_transition: z.lazy(() => workflow_transitionUncheckedCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  workspace_feature: z.lazy(() => workspace_featureUncheckedCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  workspace_usage_metric: z.lazy(() => workspace_usage_metricUncheckedCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  approval_sla_policy: z.lazy(() => approval_sla_policyUncheckedCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  approval_template: z.lazy(() => approval_templateUncheckedCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  approval_template_rule: z.lazy(() => approval_template_ruleUncheckedCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  approval_template_stage: z.lazy(() => approval_template_stageUncheckedCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  entity: z.lazy(() => entityUncheckedCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  entity_compiled: z.lazy(() => entity_compiledUncheckedCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  entity_compiled_overlay: z.lazy(() => entity_compiled_overlayUncheckedCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  entity_lifecycle: z.lazy(() => entity_lifecycleUncheckedCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  entity_lifecycle_route_compiled: z.lazy(() => entity_lifecycle_route_compiledUncheckedCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  entity_policy: z.lazy(() => entity_policyUncheckedCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  entity_version: z.lazy(() => entity_versionUncheckedCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  field: z.lazy(() => fieldUncheckedCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  field_security_policy: z.lazy(() => field_security_policyUncheckedCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  index_def: z.lazy(() => index_defUncheckedCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  meta_lifecycle: z.lazy(() => meta_lifecycleUncheckedCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  lifecycle_state: z.lazy(() => lifecycle_stateUncheckedCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  lifecycle_timer_policy: z.lazy(() => lifecycle_timer_policyUncheckedCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  lifecycle_transition: z.lazy(() => lifecycle_transitionUncheckedCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  lifecycle_transition_gate: z.lazy(() => lifecycle_transition_gateUncheckedCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  overlay: z.lazy(() => overlayUncheckedCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  overlay_change: z.lazy(() => overlay_changeUncheckedCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  permission_policy: z.lazy(() => PermissionPolicyUncheckedCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  permission_policy_compiled: z.lazy(() => PermissionPolicyCompiledUncheckedCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  permission_policy_version: z.lazy(() => PermissionPolicyVersionUncheckedCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  permission_rule: z.lazy(() => PermissionRuleUncheckedCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  permission_rule_operation: z.lazy(() => PermissionRuleOperationUncheckedCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  relation: z.lazy(() => relationUncheckedCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  dashboard_widget: z.lazy(() => dashboard_widgetUncheckedCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  notification: z.lazy(() => notificationUncheckedCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  notification_preference: z.lazy(() => notification_preferenceUncheckedCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  recent_activity: z.lazy(() => recent_activityUncheckedCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  saved_view: z.lazy(() => saved_viewUncheckedCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  search_history: z.lazy(() => search_historyUncheckedCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  user_preference: z.lazy(() => user_preferenceUncheckedCreateNestedManyWithoutTenantInputObjectSchema).optional()
}).strict();
export const TenantUncheckedCreateInputObjectSchema: z.ZodType<Prisma.TenantUncheckedCreateInput> = makeSchema() as unknown as z.ZodType<Prisma.TenantUncheckedCreateInput>;
export const TenantUncheckedCreateInputObjectZodSchema = makeSchema();
