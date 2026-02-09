import * as z from 'zod';
import type { Prisma } from '@prisma/client';
import { StringFieldUpdateOperationsInputObjectSchema as StringFieldUpdateOperationsInputObjectSchema } from './StringFieldUpdateOperationsInput.schema';
import { NullableStringFieldUpdateOperationsInputObjectSchema as NullableStringFieldUpdateOperationsInputObjectSchema } from './NullableStringFieldUpdateOperationsInput.schema';
import { DateTimeFieldUpdateOperationsInputObjectSchema as DateTimeFieldUpdateOperationsInputObjectSchema } from './DateTimeFieldUpdateOperationsInput.schema';
import { NullableDateTimeFieldUpdateOperationsInputObjectSchema as NullableDateTimeFieldUpdateOperationsInputObjectSchema } from './NullableDateTimeFieldUpdateOperationsInput.schema';
import { addressUpdateManyWithoutTenantNestedInputObjectSchema as addressUpdateManyWithoutTenantNestedInputObjectSchema } from './addressUpdateManyWithoutTenantNestedInput.schema';
import { address_linkUpdateManyWithoutTenantNestedInputObjectSchema as address_linkUpdateManyWithoutTenantNestedInputObjectSchema } from './address_linkUpdateManyWithoutTenantNestedInput.schema';
import { approval_commentUpdateManyWithoutTenantNestedInputObjectSchema as approval_commentUpdateManyWithoutTenantNestedInputObjectSchema } from './approval_commentUpdateManyWithoutTenantNestedInput.schema';
import { approval_definitionUpdateManyWithoutTenantNestedInputObjectSchema as approval_definitionUpdateManyWithoutTenantNestedInputObjectSchema } from './approval_definitionUpdateManyWithoutTenantNestedInput.schema';
import { approval_instanceUpdateManyWithoutTenantNestedInputObjectSchema as approval_instanceUpdateManyWithoutTenantNestedInputObjectSchema } from './approval_instanceUpdateManyWithoutTenantNestedInput.schema';
import { approval_taskUpdateManyWithoutTenantNestedInputObjectSchema as approval_taskUpdateManyWithoutTenantNestedInputObjectSchema } from './approval_taskUpdateManyWithoutTenantNestedInput.schema';
import { attachmentUpdateManyWithoutTenantNestedInputObjectSchema as attachmentUpdateManyWithoutTenantNestedInputObjectSchema } from './attachmentUpdateManyWithoutTenantNestedInput.schema';
import { audit_logUpdateManyWithoutTenantNestedInputObjectSchema as audit_logUpdateManyWithoutTenantNestedInputObjectSchema } from './audit_logUpdateManyWithoutTenantNestedInput.schema';
import { contact_phoneUpdateManyWithoutTenantNestedInputObjectSchema as contact_phoneUpdateManyWithoutTenantNestedInputObjectSchema } from './contact_phoneUpdateManyWithoutTenantNestedInput.schema';
import { contact_pointUpdateManyWithoutTenantNestedInputObjectSchema as contact_pointUpdateManyWithoutTenantNestedInputObjectSchema } from './contact_pointUpdateManyWithoutTenantNestedInput.schema';
import { documentUpdateManyWithoutTenantNestedInputObjectSchema as documentUpdateManyWithoutTenantNestedInputObjectSchema } from './documentUpdateManyWithoutTenantNestedInput.schema';
import { email_otp_instanceUpdateManyWithoutTenantNestedInputObjectSchema as email_otp_instanceUpdateManyWithoutTenantNestedInputObjectSchema } from './email_otp_instanceUpdateManyWithoutTenantNestedInput.schema';
import { entitlementUpdateManyWithoutTenantNestedInputObjectSchema as entitlementUpdateManyWithoutTenantNestedInputObjectSchema } from './entitlementUpdateManyWithoutTenantNestedInput.schema';
import { entity_tagUpdateManyWithoutTenantNestedInputObjectSchema as entity_tagUpdateManyWithoutTenantNestedInputObjectSchema } from './entity_tagUpdateManyWithoutTenantNestedInput.schema';
import { feature_flagUpdateManyWithoutTenantNestedInputObjectSchema as feature_flagUpdateManyWithoutTenantNestedInputObjectSchema } from './feature_flagUpdateManyWithoutTenantNestedInput.schema';
import { field_access_logUpdateManyWithoutTenantNestedInputObjectSchema as field_access_logUpdateManyWithoutTenantNestedInputObjectSchema } from './field_access_logUpdateManyWithoutTenantNestedInput.schema';
import { GroupMemberUpdateManyWithoutTenantNestedInputObjectSchema as GroupMemberUpdateManyWithoutTenantNestedInputObjectSchema } from './GroupMemberUpdateManyWithoutTenantNestedInput.schema';
import { IdpIdentityUpdateManyWithoutTenantNestedInputObjectSchema as IdpIdentityUpdateManyWithoutTenantNestedInputObjectSchema } from './IdpIdentityUpdateManyWithoutTenantNestedInput.schema';
import { jobUpdateManyWithoutTenantNestedInputObjectSchema as jobUpdateManyWithoutTenantNestedInputObjectSchema } from './jobUpdateManyWithoutTenantNestedInput.schema';
import { job_runUpdateManyWithoutTenantNestedInputObjectSchema as job_runUpdateManyWithoutTenantNestedInputObjectSchema } from './job_runUpdateManyWithoutTenantNestedInput.schema';
import { core_lifecycleUpdateManyWithoutTenantNestedInputObjectSchema as core_lifecycleUpdateManyWithoutTenantNestedInputObjectSchema } from './core_lifecycleUpdateManyWithoutTenantNestedInput.schema';
import { lifecycle_versionUpdateManyWithoutTenantNestedInputObjectSchema as lifecycle_versionUpdateManyWithoutTenantNestedInputObjectSchema } from './lifecycle_versionUpdateManyWithoutTenantNestedInput.schema';
import { mfa_challengeUpdateManyWithoutTenantNestedInputObjectSchema as mfa_challengeUpdateManyWithoutTenantNestedInputObjectSchema } from './mfa_challengeUpdateManyWithoutTenantNestedInput.schema';
import { mfa_configUpdateManyWithoutTenantNestedInputObjectSchema as mfa_configUpdateManyWithoutTenantNestedInputObjectSchema } from './mfa_configUpdateManyWithoutTenantNestedInput.schema';
import { organizational_unitUpdateManyWithoutTenantNestedInputObjectSchema as organizational_unitUpdateManyWithoutTenantNestedInputObjectSchema } from './organizational_unitUpdateManyWithoutTenantNestedInput.schema';
import { outboxUpdateManyWithoutTenantNestedInputObjectSchema as outboxUpdateManyWithoutTenantNestedInputObjectSchema } from './outboxUpdateManyWithoutTenantNestedInput.schema';
import { password_historyUpdateManyWithoutTenantNestedInputObjectSchema as password_historyUpdateManyWithoutTenantNestedInputObjectSchema } from './password_historyUpdateManyWithoutTenantNestedInput.schema';
import { PermissionDecisionLogUpdateManyWithoutTenantNestedInputObjectSchema as PermissionDecisionLogUpdateManyWithoutTenantNestedInputObjectSchema } from './PermissionDecisionLogUpdateManyWithoutTenantNestedInput.schema';
import { PrincipalUpdateManyWithoutTenantNestedInputObjectSchema as PrincipalUpdateManyWithoutTenantNestedInputObjectSchema } from './PrincipalUpdateManyWithoutTenantNestedInput.schema';
import { principal_groupUpdateManyWithoutTenantNestedInputObjectSchema as principal_groupUpdateManyWithoutTenantNestedInputObjectSchema } from './principal_groupUpdateManyWithoutTenantNestedInput.schema';
import { principal_locale_overrideUpdateManyWithoutTenantNestedInputObjectSchema as principal_locale_overrideUpdateManyWithoutTenantNestedInputObjectSchema } from './principal_locale_overrideUpdateManyWithoutTenantNestedInput.schema';
import { principal_ouUpdateManyWithoutTenantNestedInputObjectSchema as principal_ouUpdateManyWithoutTenantNestedInputObjectSchema } from './principal_ouUpdateManyWithoutTenantNestedInput.schema';
import { PrincipalProfileUpdateManyWithoutTenantNestedInputObjectSchema as PrincipalProfileUpdateManyWithoutTenantNestedInputObjectSchema } from './PrincipalProfileUpdateManyWithoutTenantNestedInput.schema';
import { principal_roleUpdateManyWithoutTenantNestedInputObjectSchema as principal_roleUpdateManyWithoutTenantNestedInputObjectSchema } from './principal_roleUpdateManyWithoutTenantNestedInput.schema';
import { principal_workspace_accessUpdateManyWithoutTenantNestedInputObjectSchema as principal_workspace_accessUpdateManyWithoutTenantNestedInputObjectSchema } from './principal_workspace_accessUpdateManyWithoutTenantNestedInput.schema';
import { RoleUpdateManyWithoutTenantNestedInputObjectSchema as RoleUpdateManyWithoutTenantNestedInputObjectSchema } from './RoleUpdateManyWithoutTenantNestedInput.schema';
import { security_eventUpdateManyWithoutTenantNestedInputObjectSchema as security_eventUpdateManyWithoutTenantNestedInputObjectSchema } from './security_eventUpdateManyWithoutTenantNestedInput.schema';
import { sms_otp_instanceUpdateManyWithoutTenantNestedInputObjectSchema as sms_otp_instanceUpdateManyWithoutTenantNestedInputObjectSchema } from './sms_otp_instanceUpdateManyWithoutTenantNestedInput.schema';
import { system_configUpdateManyWithoutTenantNestedInputObjectSchema as system_configUpdateManyWithoutTenantNestedInputObjectSchema } from './system_configUpdateManyWithoutTenantNestedInput.schema';
import { tenant_locale_policyUpdateManyWithoutTenantNestedInputObjectSchema as tenant_locale_policyUpdateManyWithoutTenantNestedInputObjectSchema } from './tenant_locale_policyUpdateManyWithoutTenantNestedInput.schema';
import { tenant_module_subscriptionUpdateManyWithoutTenantNestedInputObjectSchema as tenant_module_subscriptionUpdateManyWithoutTenantNestedInputObjectSchema } from './tenant_module_subscriptionUpdateManyWithoutTenantNestedInput.schema';
import { TenantProfileUpdateOneWithoutTenantNestedInputObjectSchema as TenantProfileUpdateOneWithoutTenantNestedInputObjectSchema } from './TenantProfileUpdateOneWithoutTenantNestedInput.schema';
import { totp_instanceUpdateManyWithoutTenantNestedInputObjectSchema as totp_instanceUpdateManyWithoutTenantNestedInputObjectSchema } from './totp_instanceUpdateManyWithoutTenantNestedInput.schema';
import { trusted_deviceUpdateManyWithoutTenantNestedInputObjectSchema as trusted_deviceUpdateManyWithoutTenantNestedInputObjectSchema } from './trusted_deviceUpdateManyWithoutTenantNestedInput.schema';
import { webauthn_credentialUpdateManyWithoutTenantNestedInputObjectSchema as webauthn_credentialUpdateManyWithoutTenantNestedInputObjectSchema } from './webauthn_credentialUpdateManyWithoutTenantNestedInput.schema';
import { workflow_instanceUpdateManyWithoutTenantNestedInputObjectSchema as workflow_instanceUpdateManyWithoutTenantNestedInputObjectSchema } from './workflow_instanceUpdateManyWithoutTenantNestedInput.schema';
import { workflow_transitionUpdateManyWithoutTenantNestedInputObjectSchema as workflow_transitionUpdateManyWithoutTenantNestedInputObjectSchema } from './workflow_transitionUpdateManyWithoutTenantNestedInput.schema';
import { workspace_featureUpdateManyWithoutTenantNestedInputObjectSchema as workspace_featureUpdateManyWithoutTenantNestedInputObjectSchema } from './workspace_featureUpdateManyWithoutTenantNestedInput.schema';
import { workspace_usage_metricUpdateManyWithoutTenantNestedInputObjectSchema as workspace_usage_metricUpdateManyWithoutTenantNestedInputObjectSchema } from './workspace_usage_metricUpdateManyWithoutTenantNestedInput.schema';
import { approval_sla_policyUpdateManyWithoutTenantNestedInputObjectSchema as approval_sla_policyUpdateManyWithoutTenantNestedInputObjectSchema } from './approval_sla_policyUpdateManyWithoutTenantNestedInput.schema';
import { approval_templateUpdateManyWithoutTenantNestedInputObjectSchema as approval_templateUpdateManyWithoutTenantNestedInputObjectSchema } from './approval_templateUpdateManyWithoutTenantNestedInput.schema';
import { approval_template_ruleUpdateManyWithoutTenantNestedInputObjectSchema as approval_template_ruleUpdateManyWithoutTenantNestedInputObjectSchema } from './approval_template_ruleUpdateManyWithoutTenantNestedInput.schema';
import { approval_template_stageUpdateManyWithoutTenantNestedInputObjectSchema as approval_template_stageUpdateManyWithoutTenantNestedInputObjectSchema } from './approval_template_stageUpdateManyWithoutTenantNestedInput.schema';
import { entityUpdateManyWithoutTenantNestedInputObjectSchema as entityUpdateManyWithoutTenantNestedInputObjectSchema } from './entityUpdateManyWithoutTenantNestedInput.schema';
import { entity_compiledUpdateManyWithoutTenantNestedInputObjectSchema as entity_compiledUpdateManyWithoutTenantNestedInputObjectSchema } from './entity_compiledUpdateManyWithoutTenantNestedInput.schema';
import { entity_compiled_overlayUpdateManyWithoutTenantNestedInputObjectSchema as entity_compiled_overlayUpdateManyWithoutTenantNestedInputObjectSchema } from './entity_compiled_overlayUpdateManyWithoutTenantNestedInput.schema';
import { entity_lifecycleUpdateManyWithoutTenantNestedInputObjectSchema as entity_lifecycleUpdateManyWithoutTenantNestedInputObjectSchema } from './entity_lifecycleUpdateManyWithoutTenantNestedInput.schema';
import { entity_lifecycle_route_compiledUpdateManyWithoutTenantNestedInputObjectSchema as entity_lifecycle_route_compiledUpdateManyWithoutTenantNestedInputObjectSchema } from './entity_lifecycle_route_compiledUpdateManyWithoutTenantNestedInput.schema';
import { entity_policyUpdateManyWithoutTenantNestedInputObjectSchema as entity_policyUpdateManyWithoutTenantNestedInputObjectSchema } from './entity_policyUpdateManyWithoutTenantNestedInput.schema';
import { entity_versionUpdateManyWithoutTenantNestedInputObjectSchema as entity_versionUpdateManyWithoutTenantNestedInputObjectSchema } from './entity_versionUpdateManyWithoutTenantNestedInput.schema';
import { fieldUpdateManyWithoutTenantNestedInputObjectSchema as fieldUpdateManyWithoutTenantNestedInputObjectSchema } from './fieldUpdateManyWithoutTenantNestedInput.schema';
import { field_security_policyUpdateManyWithoutTenantNestedInputObjectSchema as field_security_policyUpdateManyWithoutTenantNestedInputObjectSchema } from './field_security_policyUpdateManyWithoutTenantNestedInput.schema';
import { index_defUpdateManyWithoutTenantNestedInputObjectSchema as index_defUpdateManyWithoutTenantNestedInputObjectSchema } from './index_defUpdateManyWithoutTenantNestedInput.schema';
import { meta_lifecycleUpdateManyWithoutTenantNestedInputObjectSchema as meta_lifecycleUpdateManyWithoutTenantNestedInputObjectSchema } from './meta_lifecycleUpdateManyWithoutTenantNestedInput.schema';
import { lifecycle_stateUpdateManyWithoutTenantNestedInputObjectSchema as lifecycle_stateUpdateManyWithoutTenantNestedInputObjectSchema } from './lifecycle_stateUpdateManyWithoutTenantNestedInput.schema';
import { lifecycle_timer_policyUpdateManyWithoutTenantNestedInputObjectSchema as lifecycle_timer_policyUpdateManyWithoutTenantNestedInputObjectSchema } from './lifecycle_timer_policyUpdateManyWithoutTenantNestedInput.schema';
import { lifecycle_transitionUpdateManyWithoutTenantNestedInputObjectSchema as lifecycle_transitionUpdateManyWithoutTenantNestedInputObjectSchema } from './lifecycle_transitionUpdateManyWithoutTenantNestedInput.schema';
import { lifecycle_transition_gateUpdateManyWithoutTenantNestedInputObjectSchema as lifecycle_transition_gateUpdateManyWithoutTenantNestedInputObjectSchema } from './lifecycle_transition_gateUpdateManyWithoutTenantNestedInput.schema';
import { overlayUpdateManyWithoutTenantNestedInputObjectSchema as overlayUpdateManyWithoutTenantNestedInputObjectSchema } from './overlayUpdateManyWithoutTenantNestedInput.schema';
import { overlay_changeUpdateManyWithoutTenantNestedInputObjectSchema as overlay_changeUpdateManyWithoutTenantNestedInputObjectSchema } from './overlay_changeUpdateManyWithoutTenantNestedInput.schema';
import { PermissionPolicyUpdateManyWithoutTenantNestedInputObjectSchema as PermissionPolicyUpdateManyWithoutTenantNestedInputObjectSchema } from './PermissionPolicyUpdateManyWithoutTenantNestedInput.schema';
import { PermissionPolicyCompiledUpdateManyWithoutTenantNestedInputObjectSchema as PermissionPolicyCompiledUpdateManyWithoutTenantNestedInputObjectSchema } from './PermissionPolicyCompiledUpdateManyWithoutTenantNestedInput.schema';
import { PermissionPolicyVersionUpdateManyWithoutTenantNestedInputObjectSchema as PermissionPolicyVersionUpdateManyWithoutTenantNestedInputObjectSchema } from './PermissionPolicyVersionUpdateManyWithoutTenantNestedInput.schema';
import { PermissionRuleUpdateManyWithoutTenantNestedInputObjectSchema as PermissionRuleUpdateManyWithoutTenantNestedInputObjectSchema } from './PermissionRuleUpdateManyWithoutTenantNestedInput.schema';
import { PermissionRuleOperationUpdateManyWithoutTenantNestedInputObjectSchema as PermissionRuleOperationUpdateManyWithoutTenantNestedInputObjectSchema } from './PermissionRuleOperationUpdateManyWithoutTenantNestedInput.schema';
import { relationUpdateManyWithoutTenantNestedInputObjectSchema as relationUpdateManyWithoutTenantNestedInputObjectSchema } from './relationUpdateManyWithoutTenantNestedInput.schema';
import { dashboard_widgetUpdateManyWithoutTenantNestedInputObjectSchema as dashboard_widgetUpdateManyWithoutTenantNestedInputObjectSchema } from './dashboard_widgetUpdateManyWithoutTenantNestedInput.schema';
import { notificationUpdateManyWithoutTenantNestedInputObjectSchema as notificationUpdateManyWithoutTenantNestedInputObjectSchema } from './notificationUpdateManyWithoutTenantNestedInput.schema';
import { notification_preferenceUpdateManyWithoutTenantNestedInputObjectSchema as notification_preferenceUpdateManyWithoutTenantNestedInputObjectSchema } from './notification_preferenceUpdateManyWithoutTenantNestedInput.schema';
import { recent_activityUpdateManyWithoutTenantNestedInputObjectSchema as recent_activityUpdateManyWithoutTenantNestedInputObjectSchema } from './recent_activityUpdateManyWithoutTenantNestedInput.schema';
import { saved_viewUpdateManyWithoutTenantNestedInputObjectSchema as saved_viewUpdateManyWithoutTenantNestedInputObjectSchema } from './saved_viewUpdateManyWithoutTenantNestedInput.schema';
import { search_historyUpdateManyWithoutTenantNestedInputObjectSchema as search_historyUpdateManyWithoutTenantNestedInputObjectSchema } from './search_historyUpdateManyWithoutTenantNestedInput.schema';
import { user_preferenceUpdateManyWithoutTenantNestedInputObjectSchema as user_preferenceUpdateManyWithoutTenantNestedInputObjectSchema } from './user_preferenceUpdateManyWithoutTenantNestedInput.schema'

const makeSchema = () => z.object({
  id: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputObjectSchema)]).optional(),
  code: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputObjectSchema)]).optional(),
  name: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputObjectSchema)]).optional(),
  display_name: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputObjectSchema)]).optional(),
  realm_key: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputObjectSchema)]).optional(),
  status: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputObjectSchema)]).optional(),
  region: z.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  subscription: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputObjectSchema)]).optional(),
  createdAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputObjectSchema)]).optional(),
  createdBy: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputObjectSchema)]).optional(),
  updatedAt: z.union([z.coerce.date(), z.lazy(() => NullableDateTimeFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  updatedBy: z.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  address: z.lazy(() => addressUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  address_link: z.lazy(() => address_linkUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  approval_comment: z.lazy(() => approval_commentUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  approval_definition: z.lazy(() => approval_definitionUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  approval_instance: z.lazy(() => approval_instanceUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  approval_task: z.lazy(() => approval_taskUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  attachment: z.lazy(() => attachmentUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  audit_log: z.lazy(() => audit_logUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  contact_phone: z.lazy(() => contact_phoneUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  contact_point: z.lazy(() => contact_pointUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  document: z.lazy(() => documentUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  email_otp_instance: z.lazy(() => email_otp_instanceUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  entitlement: z.lazy(() => entitlementUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  entity_tag: z.lazy(() => entity_tagUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  feature_flag: z.lazy(() => feature_flagUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  field_access_log: z.lazy(() => field_access_logUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  groupMembers: z.lazy(() => GroupMemberUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  idpIdentities: z.lazy(() => IdpIdentityUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  job: z.lazy(() => jobUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  job_run: z.lazy(() => job_runUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  lifecycle: z.lazy(() => core_lifecycleUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  lifecycle_version: z.lazy(() => lifecycle_versionUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  mfa_challenge: z.lazy(() => mfa_challengeUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  mfa_config: z.lazy(() => mfa_configUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  organizational_unit: z.lazy(() => organizational_unitUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  outbox: z.lazy(() => outboxUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  password_history: z.lazy(() => password_historyUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  permission_decision_log: z.lazy(() => PermissionDecisionLogUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  principals: z.lazy(() => PrincipalUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  principal_group: z.lazy(() => principal_groupUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  principal_locale_override: z.lazy(() => principal_locale_overrideUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  principal_ou: z.lazy(() => principal_ouUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  principalProfiles: z.lazy(() => PrincipalProfileUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  principal_role: z.lazy(() => principal_roleUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  principal_workspace_access: z.lazy(() => principal_workspace_accessUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  roles: z.lazy(() => RoleUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  security_event: z.lazy(() => security_eventUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  sms_otp_instance: z.lazy(() => sms_otp_instanceUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  system_config: z.lazy(() => system_configUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  tenant_locale_policy: z.lazy(() => tenant_locale_policyUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  tenant_module_subscription: z.lazy(() => tenant_module_subscriptionUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  tenantProfile: z.lazy(() => TenantProfileUpdateOneWithoutTenantNestedInputObjectSchema).optional(),
  totp_instance: z.lazy(() => totp_instanceUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  trusted_device: z.lazy(() => trusted_deviceUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  webauthn_credential: z.lazy(() => webauthn_credentialUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  workflow_instance: z.lazy(() => workflow_instanceUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  workflow_transition: z.lazy(() => workflow_transitionUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  workspace_feature: z.lazy(() => workspace_featureUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  workspace_usage_metric: z.lazy(() => workspace_usage_metricUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  approval_sla_policy: z.lazy(() => approval_sla_policyUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  approval_template: z.lazy(() => approval_templateUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  approval_template_rule: z.lazy(() => approval_template_ruleUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  approval_template_stage: z.lazy(() => approval_template_stageUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  entity: z.lazy(() => entityUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  entity_compiled: z.lazy(() => entity_compiledUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  entity_compiled_overlay: z.lazy(() => entity_compiled_overlayUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  entity_lifecycle: z.lazy(() => entity_lifecycleUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  entity_lifecycle_route_compiled: z.lazy(() => entity_lifecycle_route_compiledUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  entity_policy: z.lazy(() => entity_policyUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  entity_version: z.lazy(() => entity_versionUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  field: z.lazy(() => fieldUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  field_security_policy: z.lazy(() => field_security_policyUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  index_def: z.lazy(() => index_defUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  meta_lifecycle: z.lazy(() => meta_lifecycleUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  lifecycle_state: z.lazy(() => lifecycle_stateUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  lifecycle_timer_policy: z.lazy(() => lifecycle_timer_policyUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  lifecycle_transition: z.lazy(() => lifecycle_transitionUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  lifecycle_transition_gate: z.lazy(() => lifecycle_transition_gateUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  overlay: z.lazy(() => overlayUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  overlay_change: z.lazy(() => overlay_changeUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  permission_policy: z.lazy(() => PermissionPolicyUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  permission_policy_compiled: z.lazy(() => PermissionPolicyCompiledUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  permission_policy_version: z.lazy(() => PermissionPolicyVersionUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  permission_rule: z.lazy(() => PermissionRuleUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  permission_rule_operation: z.lazy(() => PermissionRuleOperationUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  relation: z.lazy(() => relationUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  dashboard_widget: z.lazy(() => dashboard_widgetUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  notification: z.lazy(() => notificationUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  notification_preference: z.lazy(() => notification_preferenceUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  recent_activity: z.lazy(() => recent_activityUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  saved_view: z.lazy(() => saved_viewUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  search_history: z.lazy(() => search_historyUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  user_preference: z.lazy(() => user_preferenceUpdateManyWithoutTenantNestedInputObjectSchema).optional()
}).strict();
export const TenantUpdateInputObjectSchema: z.ZodType<Prisma.TenantUpdateInput> = makeSchema() as unknown as z.ZodType<Prisma.TenantUpdateInput>;
export const TenantUpdateInputObjectZodSchema = makeSchema();
