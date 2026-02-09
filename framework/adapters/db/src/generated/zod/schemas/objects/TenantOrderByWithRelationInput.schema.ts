import * as z from 'zod';
import type { Prisma } from '@prisma/client';
import { SortOrderSchema } from '../enums/SortOrder.schema';
import { SortOrderInputObjectSchema as SortOrderInputObjectSchema } from './SortOrderInput.schema';
import { addressOrderByRelationAggregateInputObjectSchema as addressOrderByRelationAggregateInputObjectSchema } from './addressOrderByRelationAggregateInput.schema';
import { address_linkOrderByRelationAggregateInputObjectSchema as address_linkOrderByRelationAggregateInputObjectSchema } from './address_linkOrderByRelationAggregateInput.schema';
import { approval_commentOrderByRelationAggregateInputObjectSchema as approval_commentOrderByRelationAggregateInputObjectSchema } from './approval_commentOrderByRelationAggregateInput.schema';
import { approval_definitionOrderByRelationAggregateInputObjectSchema as approval_definitionOrderByRelationAggregateInputObjectSchema } from './approval_definitionOrderByRelationAggregateInput.schema';
import { approval_instanceOrderByRelationAggregateInputObjectSchema as approval_instanceOrderByRelationAggregateInputObjectSchema } from './approval_instanceOrderByRelationAggregateInput.schema';
import { approval_taskOrderByRelationAggregateInputObjectSchema as approval_taskOrderByRelationAggregateInputObjectSchema } from './approval_taskOrderByRelationAggregateInput.schema';
import { attachmentOrderByRelationAggregateInputObjectSchema as attachmentOrderByRelationAggregateInputObjectSchema } from './attachmentOrderByRelationAggregateInput.schema';
import { audit_logOrderByRelationAggregateInputObjectSchema as audit_logOrderByRelationAggregateInputObjectSchema } from './audit_logOrderByRelationAggregateInput.schema';
import { contact_phoneOrderByRelationAggregateInputObjectSchema as contact_phoneOrderByRelationAggregateInputObjectSchema } from './contact_phoneOrderByRelationAggregateInput.schema';
import { contact_pointOrderByRelationAggregateInputObjectSchema as contact_pointOrderByRelationAggregateInputObjectSchema } from './contact_pointOrderByRelationAggregateInput.schema';
import { documentOrderByRelationAggregateInputObjectSchema as documentOrderByRelationAggregateInputObjectSchema } from './documentOrderByRelationAggregateInput.schema';
import { email_otp_instanceOrderByRelationAggregateInputObjectSchema as email_otp_instanceOrderByRelationAggregateInputObjectSchema } from './email_otp_instanceOrderByRelationAggregateInput.schema';
import { entitlementOrderByRelationAggregateInputObjectSchema as entitlementOrderByRelationAggregateInputObjectSchema } from './entitlementOrderByRelationAggregateInput.schema';
import { entity_tagOrderByRelationAggregateInputObjectSchema as entity_tagOrderByRelationAggregateInputObjectSchema } from './entity_tagOrderByRelationAggregateInput.schema';
import { feature_flagOrderByRelationAggregateInputObjectSchema as feature_flagOrderByRelationAggregateInputObjectSchema } from './feature_flagOrderByRelationAggregateInput.schema';
import { field_access_logOrderByRelationAggregateInputObjectSchema as field_access_logOrderByRelationAggregateInputObjectSchema } from './field_access_logOrderByRelationAggregateInput.schema';
import { GroupMemberOrderByRelationAggregateInputObjectSchema as GroupMemberOrderByRelationAggregateInputObjectSchema } from './GroupMemberOrderByRelationAggregateInput.schema';
import { IdpIdentityOrderByRelationAggregateInputObjectSchema as IdpIdentityOrderByRelationAggregateInputObjectSchema } from './IdpIdentityOrderByRelationAggregateInput.schema';
import { jobOrderByRelationAggregateInputObjectSchema as jobOrderByRelationAggregateInputObjectSchema } from './jobOrderByRelationAggregateInput.schema';
import { job_runOrderByRelationAggregateInputObjectSchema as job_runOrderByRelationAggregateInputObjectSchema } from './job_runOrderByRelationAggregateInput.schema';
import { core_lifecycleOrderByRelationAggregateInputObjectSchema as core_lifecycleOrderByRelationAggregateInputObjectSchema } from './core_lifecycleOrderByRelationAggregateInput.schema';
import { lifecycle_versionOrderByRelationAggregateInputObjectSchema as lifecycle_versionOrderByRelationAggregateInputObjectSchema } from './lifecycle_versionOrderByRelationAggregateInput.schema';
import { mfa_challengeOrderByRelationAggregateInputObjectSchema as mfa_challengeOrderByRelationAggregateInputObjectSchema } from './mfa_challengeOrderByRelationAggregateInput.schema';
import { mfa_configOrderByRelationAggregateInputObjectSchema as mfa_configOrderByRelationAggregateInputObjectSchema } from './mfa_configOrderByRelationAggregateInput.schema';
import { organizational_unitOrderByRelationAggregateInputObjectSchema as organizational_unitOrderByRelationAggregateInputObjectSchema } from './organizational_unitOrderByRelationAggregateInput.schema';
import { outboxOrderByRelationAggregateInputObjectSchema as outboxOrderByRelationAggregateInputObjectSchema } from './outboxOrderByRelationAggregateInput.schema';
import { password_historyOrderByRelationAggregateInputObjectSchema as password_historyOrderByRelationAggregateInputObjectSchema } from './password_historyOrderByRelationAggregateInput.schema';
import { PermissionDecisionLogOrderByRelationAggregateInputObjectSchema as PermissionDecisionLogOrderByRelationAggregateInputObjectSchema } from './PermissionDecisionLogOrderByRelationAggregateInput.schema';
import { PrincipalOrderByRelationAggregateInputObjectSchema as PrincipalOrderByRelationAggregateInputObjectSchema } from './PrincipalOrderByRelationAggregateInput.schema';
import { principal_groupOrderByRelationAggregateInputObjectSchema as principal_groupOrderByRelationAggregateInputObjectSchema } from './principal_groupOrderByRelationAggregateInput.schema';
import { principal_locale_overrideOrderByRelationAggregateInputObjectSchema as principal_locale_overrideOrderByRelationAggregateInputObjectSchema } from './principal_locale_overrideOrderByRelationAggregateInput.schema';
import { principal_ouOrderByRelationAggregateInputObjectSchema as principal_ouOrderByRelationAggregateInputObjectSchema } from './principal_ouOrderByRelationAggregateInput.schema';
import { PrincipalProfileOrderByRelationAggregateInputObjectSchema as PrincipalProfileOrderByRelationAggregateInputObjectSchema } from './PrincipalProfileOrderByRelationAggregateInput.schema';
import { principal_roleOrderByRelationAggregateInputObjectSchema as principal_roleOrderByRelationAggregateInputObjectSchema } from './principal_roleOrderByRelationAggregateInput.schema';
import { principal_workspace_accessOrderByRelationAggregateInputObjectSchema as principal_workspace_accessOrderByRelationAggregateInputObjectSchema } from './principal_workspace_accessOrderByRelationAggregateInput.schema';
import { RoleOrderByRelationAggregateInputObjectSchema as RoleOrderByRelationAggregateInputObjectSchema } from './RoleOrderByRelationAggregateInput.schema';
import { security_eventOrderByRelationAggregateInputObjectSchema as security_eventOrderByRelationAggregateInputObjectSchema } from './security_eventOrderByRelationAggregateInput.schema';
import { sms_otp_instanceOrderByRelationAggregateInputObjectSchema as sms_otp_instanceOrderByRelationAggregateInputObjectSchema } from './sms_otp_instanceOrderByRelationAggregateInput.schema';
import { system_configOrderByRelationAggregateInputObjectSchema as system_configOrderByRelationAggregateInputObjectSchema } from './system_configOrderByRelationAggregateInput.schema';
import { tenant_locale_policyOrderByRelationAggregateInputObjectSchema as tenant_locale_policyOrderByRelationAggregateInputObjectSchema } from './tenant_locale_policyOrderByRelationAggregateInput.schema';
import { tenant_module_subscriptionOrderByRelationAggregateInputObjectSchema as tenant_module_subscriptionOrderByRelationAggregateInputObjectSchema } from './tenant_module_subscriptionOrderByRelationAggregateInput.schema';
import { TenantProfileOrderByWithRelationInputObjectSchema as TenantProfileOrderByWithRelationInputObjectSchema } from './TenantProfileOrderByWithRelationInput.schema';
import { totp_instanceOrderByRelationAggregateInputObjectSchema as totp_instanceOrderByRelationAggregateInputObjectSchema } from './totp_instanceOrderByRelationAggregateInput.schema';
import { trusted_deviceOrderByRelationAggregateInputObjectSchema as trusted_deviceOrderByRelationAggregateInputObjectSchema } from './trusted_deviceOrderByRelationAggregateInput.schema';
import { webauthn_credentialOrderByRelationAggregateInputObjectSchema as webauthn_credentialOrderByRelationAggregateInputObjectSchema } from './webauthn_credentialOrderByRelationAggregateInput.schema';
import { workflow_instanceOrderByRelationAggregateInputObjectSchema as workflow_instanceOrderByRelationAggregateInputObjectSchema } from './workflow_instanceOrderByRelationAggregateInput.schema';
import { workflow_transitionOrderByRelationAggregateInputObjectSchema as workflow_transitionOrderByRelationAggregateInputObjectSchema } from './workflow_transitionOrderByRelationAggregateInput.schema';
import { workspace_featureOrderByRelationAggregateInputObjectSchema as workspace_featureOrderByRelationAggregateInputObjectSchema } from './workspace_featureOrderByRelationAggregateInput.schema';
import { workspace_usage_metricOrderByRelationAggregateInputObjectSchema as workspace_usage_metricOrderByRelationAggregateInputObjectSchema } from './workspace_usage_metricOrderByRelationAggregateInput.schema';
import { approval_sla_policyOrderByRelationAggregateInputObjectSchema as approval_sla_policyOrderByRelationAggregateInputObjectSchema } from './approval_sla_policyOrderByRelationAggregateInput.schema';
import { approval_templateOrderByRelationAggregateInputObjectSchema as approval_templateOrderByRelationAggregateInputObjectSchema } from './approval_templateOrderByRelationAggregateInput.schema';
import { approval_template_ruleOrderByRelationAggregateInputObjectSchema as approval_template_ruleOrderByRelationAggregateInputObjectSchema } from './approval_template_ruleOrderByRelationAggregateInput.schema';
import { approval_template_stageOrderByRelationAggregateInputObjectSchema as approval_template_stageOrderByRelationAggregateInputObjectSchema } from './approval_template_stageOrderByRelationAggregateInput.schema';
import { entityOrderByRelationAggregateInputObjectSchema as entityOrderByRelationAggregateInputObjectSchema } from './entityOrderByRelationAggregateInput.schema';
import { entity_compiledOrderByRelationAggregateInputObjectSchema as entity_compiledOrderByRelationAggregateInputObjectSchema } from './entity_compiledOrderByRelationAggregateInput.schema';
import { entity_compiled_overlayOrderByRelationAggregateInputObjectSchema as entity_compiled_overlayOrderByRelationAggregateInputObjectSchema } from './entity_compiled_overlayOrderByRelationAggregateInput.schema';
import { entity_lifecycleOrderByRelationAggregateInputObjectSchema as entity_lifecycleOrderByRelationAggregateInputObjectSchema } from './entity_lifecycleOrderByRelationAggregateInput.schema';
import { entity_lifecycle_route_compiledOrderByRelationAggregateInputObjectSchema as entity_lifecycle_route_compiledOrderByRelationAggregateInputObjectSchema } from './entity_lifecycle_route_compiledOrderByRelationAggregateInput.schema';
import { entity_policyOrderByRelationAggregateInputObjectSchema as entity_policyOrderByRelationAggregateInputObjectSchema } from './entity_policyOrderByRelationAggregateInput.schema';
import { entity_versionOrderByRelationAggregateInputObjectSchema as entity_versionOrderByRelationAggregateInputObjectSchema } from './entity_versionOrderByRelationAggregateInput.schema';
import { fieldOrderByRelationAggregateInputObjectSchema as fieldOrderByRelationAggregateInputObjectSchema } from './fieldOrderByRelationAggregateInput.schema';
import { field_security_policyOrderByRelationAggregateInputObjectSchema as field_security_policyOrderByRelationAggregateInputObjectSchema } from './field_security_policyOrderByRelationAggregateInput.schema';
import { index_defOrderByRelationAggregateInputObjectSchema as index_defOrderByRelationAggregateInputObjectSchema } from './index_defOrderByRelationAggregateInput.schema';
import { meta_lifecycleOrderByRelationAggregateInputObjectSchema as meta_lifecycleOrderByRelationAggregateInputObjectSchema } from './meta_lifecycleOrderByRelationAggregateInput.schema';
import { lifecycle_stateOrderByRelationAggregateInputObjectSchema as lifecycle_stateOrderByRelationAggregateInputObjectSchema } from './lifecycle_stateOrderByRelationAggregateInput.schema';
import { lifecycle_timer_policyOrderByRelationAggregateInputObjectSchema as lifecycle_timer_policyOrderByRelationAggregateInputObjectSchema } from './lifecycle_timer_policyOrderByRelationAggregateInput.schema';
import { lifecycle_transitionOrderByRelationAggregateInputObjectSchema as lifecycle_transitionOrderByRelationAggregateInputObjectSchema } from './lifecycle_transitionOrderByRelationAggregateInput.schema';
import { lifecycle_transition_gateOrderByRelationAggregateInputObjectSchema as lifecycle_transition_gateOrderByRelationAggregateInputObjectSchema } from './lifecycle_transition_gateOrderByRelationAggregateInput.schema';
import { overlayOrderByRelationAggregateInputObjectSchema as overlayOrderByRelationAggregateInputObjectSchema } from './overlayOrderByRelationAggregateInput.schema';
import { overlay_changeOrderByRelationAggregateInputObjectSchema as overlay_changeOrderByRelationAggregateInputObjectSchema } from './overlay_changeOrderByRelationAggregateInput.schema';
import { PermissionPolicyOrderByRelationAggregateInputObjectSchema as PermissionPolicyOrderByRelationAggregateInputObjectSchema } from './PermissionPolicyOrderByRelationAggregateInput.schema';
import { PermissionPolicyCompiledOrderByRelationAggregateInputObjectSchema as PermissionPolicyCompiledOrderByRelationAggregateInputObjectSchema } from './PermissionPolicyCompiledOrderByRelationAggregateInput.schema';
import { PermissionPolicyVersionOrderByRelationAggregateInputObjectSchema as PermissionPolicyVersionOrderByRelationAggregateInputObjectSchema } from './PermissionPolicyVersionOrderByRelationAggregateInput.schema';
import { PermissionRuleOrderByRelationAggregateInputObjectSchema as PermissionRuleOrderByRelationAggregateInputObjectSchema } from './PermissionRuleOrderByRelationAggregateInput.schema';
import { PermissionRuleOperationOrderByRelationAggregateInputObjectSchema as PermissionRuleOperationOrderByRelationAggregateInputObjectSchema } from './PermissionRuleOperationOrderByRelationAggregateInput.schema';
import { relationOrderByRelationAggregateInputObjectSchema as relationOrderByRelationAggregateInputObjectSchema } from './relationOrderByRelationAggregateInput.schema';
import { dashboard_widgetOrderByRelationAggregateInputObjectSchema as dashboard_widgetOrderByRelationAggregateInputObjectSchema } from './dashboard_widgetOrderByRelationAggregateInput.schema';
import { notificationOrderByRelationAggregateInputObjectSchema as notificationOrderByRelationAggregateInputObjectSchema } from './notificationOrderByRelationAggregateInput.schema';
import { notification_preferenceOrderByRelationAggregateInputObjectSchema as notification_preferenceOrderByRelationAggregateInputObjectSchema } from './notification_preferenceOrderByRelationAggregateInput.schema';
import { recent_activityOrderByRelationAggregateInputObjectSchema as recent_activityOrderByRelationAggregateInputObjectSchema } from './recent_activityOrderByRelationAggregateInput.schema';
import { saved_viewOrderByRelationAggregateInputObjectSchema as saved_viewOrderByRelationAggregateInputObjectSchema } from './saved_viewOrderByRelationAggregateInput.schema';
import { search_historyOrderByRelationAggregateInputObjectSchema as search_historyOrderByRelationAggregateInputObjectSchema } from './search_historyOrderByRelationAggregateInput.schema';
import { user_preferenceOrderByRelationAggregateInputObjectSchema as user_preferenceOrderByRelationAggregateInputObjectSchema } from './user_preferenceOrderByRelationAggregateInput.schema'

const makeSchema = () => z.object({
  id: SortOrderSchema.optional(),
  code: SortOrderSchema.optional(),
  name: SortOrderSchema.optional(),
  display_name: SortOrderSchema.optional(),
  realm_key: SortOrderSchema.optional(),
  status: SortOrderSchema.optional(),
  region: z.union([SortOrderSchema, z.lazy(() => SortOrderInputObjectSchema)]).optional(),
  subscription: SortOrderSchema.optional(),
  createdAt: SortOrderSchema.optional(),
  createdBy: SortOrderSchema.optional(),
  updatedAt: z.union([SortOrderSchema, z.lazy(() => SortOrderInputObjectSchema)]).optional(),
  updatedBy: z.union([SortOrderSchema, z.lazy(() => SortOrderInputObjectSchema)]).optional(),
  address: z.lazy(() => addressOrderByRelationAggregateInputObjectSchema).optional(),
  address_link: z.lazy(() => address_linkOrderByRelationAggregateInputObjectSchema).optional(),
  approval_comment: z.lazy(() => approval_commentOrderByRelationAggregateInputObjectSchema).optional(),
  approval_definition: z.lazy(() => approval_definitionOrderByRelationAggregateInputObjectSchema).optional(),
  approval_instance: z.lazy(() => approval_instanceOrderByRelationAggregateInputObjectSchema).optional(),
  approval_task: z.lazy(() => approval_taskOrderByRelationAggregateInputObjectSchema).optional(),
  attachment: z.lazy(() => attachmentOrderByRelationAggregateInputObjectSchema).optional(),
  audit_log: z.lazy(() => audit_logOrderByRelationAggregateInputObjectSchema).optional(),
  contact_phone: z.lazy(() => contact_phoneOrderByRelationAggregateInputObjectSchema).optional(),
  contact_point: z.lazy(() => contact_pointOrderByRelationAggregateInputObjectSchema).optional(),
  document: z.lazy(() => documentOrderByRelationAggregateInputObjectSchema).optional(),
  email_otp_instance: z.lazy(() => email_otp_instanceOrderByRelationAggregateInputObjectSchema).optional(),
  entitlement: z.lazy(() => entitlementOrderByRelationAggregateInputObjectSchema).optional(),
  entity_tag: z.lazy(() => entity_tagOrderByRelationAggregateInputObjectSchema).optional(),
  feature_flag: z.lazy(() => feature_flagOrderByRelationAggregateInputObjectSchema).optional(),
  field_access_log: z.lazy(() => field_access_logOrderByRelationAggregateInputObjectSchema).optional(),
  groupMembers: z.lazy(() => GroupMemberOrderByRelationAggregateInputObjectSchema).optional(),
  idpIdentities: z.lazy(() => IdpIdentityOrderByRelationAggregateInputObjectSchema).optional(),
  job: z.lazy(() => jobOrderByRelationAggregateInputObjectSchema).optional(),
  job_run: z.lazy(() => job_runOrderByRelationAggregateInputObjectSchema).optional(),
  lifecycle: z.lazy(() => core_lifecycleOrderByRelationAggregateInputObjectSchema).optional(),
  lifecycle_version: z.lazy(() => lifecycle_versionOrderByRelationAggregateInputObjectSchema).optional(),
  mfa_challenge: z.lazy(() => mfa_challengeOrderByRelationAggregateInputObjectSchema).optional(),
  mfa_config: z.lazy(() => mfa_configOrderByRelationAggregateInputObjectSchema).optional(),
  organizational_unit: z.lazy(() => organizational_unitOrderByRelationAggregateInputObjectSchema).optional(),
  outbox: z.lazy(() => outboxOrderByRelationAggregateInputObjectSchema).optional(),
  password_history: z.lazy(() => password_historyOrderByRelationAggregateInputObjectSchema).optional(),
  permission_decision_log: z.lazy(() => PermissionDecisionLogOrderByRelationAggregateInputObjectSchema).optional(),
  principals: z.lazy(() => PrincipalOrderByRelationAggregateInputObjectSchema).optional(),
  principal_group: z.lazy(() => principal_groupOrderByRelationAggregateInputObjectSchema).optional(),
  principal_locale_override: z.lazy(() => principal_locale_overrideOrderByRelationAggregateInputObjectSchema).optional(),
  principal_ou: z.lazy(() => principal_ouOrderByRelationAggregateInputObjectSchema).optional(),
  principalProfiles: z.lazy(() => PrincipalProfileOrderByRelationAggregateInputObjectSchema).optional(),
  principal_role: z.lazy(() => principal_roleOrderByRelationAggregateInputObjectSchema).optional(),
  principal_workspace_access: z.lazy(() => principal_workspace_accessOrderByRelationAggregateInputObjectSchema).optional(),
  roles: z.lazy(() => RoleOrderByRelationAggregateInputObjectSchema).optional(),
  security_event: z.lazy(() => security_eventOrderByRelationAggregateInputObjectSchema).optional(),
  sms_otp_instance: z.lazy(() => sms_otp_instanceOrderByRelationAggregateInputObjectSchema).optional(),
  system_config: z.lazy(() => system_configOrderByRelationAggregateInputObjectSchema).optional(),
  tenant_locale_policy: z.lazy(() => tenant_locale_policyOrderByRelationAggregateInputObjectSchema).optional(),
  tenant_module_subscription: z.lazy(() => tenant_module_subscriptionOrderByRelationAggregateInputObjectSchema).optional(),
  tenantProfile: z.lazy(() => TenantProfileOrderByWithRelationInputObjectSchema).optional(),
  totp_instance: z.lazy(() => totp_instanceOrderByRelationAggregateInputObjectSchema).optional(),
  trusted_device: z.lazy(() => trusted_deviceOrderByRelationAggregateInputObjectSchema).optional(),
  webauthn_credential: z.lazy(() => webauthn_credentialOrderByRelationAggregateInputObjectSchema).optional(),
  workflow_instance: z.lazy(() => workflow_instanceOrderByRelationAggregateInputObjectSchema).optional(),
  workflow_transition: z.lazy(() => workflow_transitionOrderByRelationAggregateInputObjectSchema).optional(),
  workspace_feature: z.lazy(() => workspace_featureOrderByRelationAggregateInputObjectSchema).optional(),
  workspace_usage_metric: z.lazy(() => workspace_usage_metricOrderByRelationAggregateInputObjectSchema).optional(),
  approval_sla_policy: z.lazy(() => approval_sla_policyOrderByRelationAggregateInputObjectSchema).optional(),
  approval_template: z.lazy(() => approval_templateOrderByRelationAggregateInputObjectSchema).optional(),
  approval_template_rule: z.lazy(() => approval_template_ruleOrderByRelationAggregateInputObjectSchema).optional(),
  approval_template_stage: z.lazy(() => approval_template_stageOrderByRelationAggregateInputObjectSchema).optional(),
  entity: z.lazy(() => entityOrderByRelationAggregateInputObjectSchema).optional(),
  entity_compiled: z.lazy(() => entity_compiledOrderByRelationAggregateInputObjectSchema).optional(),
  entity_compiled_overlay: z.lazy(() => entity_compiled_overlayOrderByRelationAggregateInputObjectSchema).optional(),
  entity_lifecycle: z.lazy(() => entity_lifecycleOrderByRelationAggregateInputObjectSchema).optional(),
  entity_lifecycle_route_compiled: z.lazy(() => entity_lifecycle_route_compiledOrderByRelationAggregateInputObjectSchema).optional(),
  entity_policy: z.lazy(() => entity_policyOrderByRelationAggregateInputObjectSchema).optional(),
  entity_version: z.lazy(() => entity_versionOrderByRelationAggregateInputObjectSchema).optional(),
  field: z.lazy(() => fieldOrderByRelationAggregateInputObjectSchema).optional(),
  field_security_policy: z.lazy(() => field_security_policyOrderByRelationAggregateInputObjectSchema).optional(),
  index_def: z.lazy(() => index_defOrderByRelationAggregateInputObjectSchema).optional(),
  meta_lifecycle: z.lazy(() => meta_lifecycleOrderByRelationAggregateInputObjectSchema).optional(),
  lifecycle_state: z.lazy(() => lifecycle_stateOrderByRelationAggregateInputObjectSchema).optional(),
  lifecycle_timer_policy: z.lazy(() => lifecycle_timer_policyOrderByRelationAggregateInputObjectSchema).optional(),
  lifecycle_transition: z.lazy(() => lifecycle_transitionOrderByRelationAggregateInputObjectSchema).optional(),
  lifecycle_transition_gate: z.lazy(() => lifecycle_transition_gateOrderByRelationAggregateInputObjectSchema).optional(),
  overlay: z.lazy(() => overlayOrderByRelationAggregateInputObjectSchema).optional(),
  overlay_change: z.lazy(() => overlay_changeOrderByRelationAggregateInputObjectSchema).optional(),
  permission_policy: z.lazy(() => PermissionPolicyOrderByRelationAggregateInputObjectSchema).optional(),
  permission_policy_compiled: z.lazy(() => PermissionPolicyCompiledOrderByRelationAggregateInputObjectSchema).optional(),
  permission_policy_version: z.lazy(() => PermissionPolicyVersionOrderByRelationAggregateInputObjectSchema).optional(),
  permission_rule: z.lazy(() => PermissionRuleOrderByRelationAggregateInputObjectSchema).optional(),
  permission_rule_operation: z.lazy(() => PermissionRuleOperationOrderByRelationAggregateInputObjectSchema).optional(),
  relation: z.lazy(() => relationOrderByRelationAggregateInputObjectSchema).optional(),
  dashboard_widget: z.lazy(() => dashboard_widgetOrderByRelationAggregateInputObjectSchema).optional(),
  notification: z.lazy(() => notificationOrderByRelationAggregateInputObjectSchema).optional(),
  notification_preference: z.lazy(() => notification_preferenceOrderByRelationAggregateInputObjectSchema).optional(),
  recent_activity: z.lazy(() => recent_activityOrderByRelationAggregateInputObjectSchema).optional(),
  saved_view: z.lazy(() => saved_viewOrderByRelationAggregateInputObjectSchema).optional(),
  search_history: z.lazy(() => search_historyOrderByRelationAggregateInputObjectSchema).optional(),
  user_preference: z.lazy(() => user_preferenceOrderByRelationAggregateInputObjectSchema).optional()
}).strict();
export const TenantOrderByWithRelationInputObjectSchema: z.ZodType<Prisma.TenantOrderByWithRelationInput> = makeSchema() as unknown as z.ZodType<Prisma.TenantOrderByWithRelationInput>;
export const TenantOrderByWithRelationInputObjectZodSchema = makeSchema();
