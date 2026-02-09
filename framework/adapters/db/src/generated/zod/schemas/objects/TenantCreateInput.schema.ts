import * as z from 'zod';
import type { Prisma } from '@prisma/client';
import { addressCreateNestedManyWithoutTenantInputObjectSchema as addressCreateNestedManyWithoutTenantInputObjectSchema } from './addressCreateNestedManyWithoutTenantInput.schema';
import { address_linkCreateNestedManyWithoutTenantInputObjectSchema as address_linkCreateNestedManyWithoutTenantInputObjectSchema } from './address_linkCreateNestedManyWithoutTenantInput.schema';
import { approval_commentCreateNestedManyWithoutTenantInputObjectSchema as approval_commentCreateNestedManyWithoutTenantInputObjectSchema } from './approval_commentCreateNestedManyWithoutTenantInput.schema';
import { approval_definitionCreateNestedManyWithoutTenantInputObjectSchema as approval_definitionCreateNestedManyWithoutTenantInputObjectSchema } from './approval_definitionCreateNestedManyWithoutTenantInput.schema';
import { approval_instanceCreateNestedManyWithoutTenantInputObjectSchema as approval_instanceCreateNestedManyWithoutTenantInputObjectSchema } from './approval_instanceCreateNestedManyWithoutTenantInput.schema';
import { approval_taskCreateNestedManyWithoutTenantInputObjectSchema as approval_taskCreateNestedManyWithoutTenantInputObjectSchema } from './approval_taskCreateNestedManyWithoutTenantInput.schema';
import { attachmentCreateNestedManyWithoutTenantInputObjectSchema as attachmentCreateNestedManyWithoutTenantInputObjectSchema } from './attachmentCreateNestedManyWithoutTenantInput.schema';
import { audit_logCreateNestedManyWithoutTenantInputObjectSchema as audit_logCreateNestedManyWithoutTenantInputObjectSchema } from './audit_logCreateNestedManyWithoutTenantInput.schema';
import { contact_phoneCreateNestedManyWithoutTenantInputObjectSchema as contact_phoneCreateNestedManyWithoutTenantInputObjectSchema } from './contact_phoneCreateNestedManyWithoutTenantInput.schema';
import { contact_pointCreateNestedManyWithoutTenantInputObjectSchema as contact_pointCreateNestedManyWithoutTenantInputObjectSchema } from './contact_pointCreateNestedManyWithoutTenantInput.schema';
import { documentCreateNestedManyWithoutTenantInputObjectSchema as documentCreateNestedManyWithoutTenantInputObjectSchema } from './documentCreateNestedManyWithoutTenantInput.schema';
import { email_otp_instanceCreateNestedManyWithoutTenantInputObjectSchema as email_otp_instanceCreateNestedManyWithoutTenantInputObjectSchema } from './email_otp_instanceCreateNestedManyWithoutTenantInput.schema';
import { entitlementCreateNestedManyWithoutTenantInputObjectSchema as entitlementCreateNestedManyWithoutTenantInputObjectSchema } from './entitlementCreateNestedManyWithoutTenantInput.schema';
import { entity_tagCreateNestedManyWithoutTenantInputObjectSchema as entity_tagCreateNestedManyWithoutTenantInputObjectSchema } from './entity_tagCreateNestedManyWithoutTenantInput.schema';
import { feature_flagCreateNestedManyWithoutTenantInputObjectSchema as feature_flagCreateNestedManyWithoutTenantInputObjectSchema } from './feature_flagCreateNestedManyWithoutTenantInput.schema';
import { field_access_logCreateNestedManyWithoutTenantInputObjectSchema as field_access_logCreateNestedManyWithoutTenantInputObjectSchema } from './field_access_logCreateNestedManyWithoutTenantInput.schema';
import { GroupMemberCreateNestedManyWithoutTenantInputObjectSchema as GroupMemberCreateNestedManyWithoutTenantInputObjectSchema } from './GroupMemberCreateNestedManyWithoutTenantInput.schema';
import { IdpIdentityCreateNestedManyWithoutTenantInputObjectSchema as IdpIdentityCreateNestedManyWithoutTenantInputObjectSchema } from './IdpIdentityCreateNestedManyWithoutTenantInput.schema';
import { jobCreateNestedManyWithoutTenantInputObjectSchema as jobCreateNestedManyWithoutTenantInputObjectSchema } from './jobCreateNestedManyWithoutTenantInput.schema';
import { job_runCreateNestedManyWithoutTenantInputObjectSchema as job_runCreateNestedManyWithoutTenantInputObjectSchema } from './job_runCreateNestedManyWithoutTenantInput.schema';
import { core_lifecycleCreateNestedManyWithoutTenantInputObjectSchema as core_lifecycleCreateNestedManyWithoutTenantInputObjectSchema } from './core_lifecycleCreateNestedManyWithoutTenantInput.schema';
import { lifecycle_versionCreateNestedManyWithoutTenantInputObjectSchema as lifecycle_versionCreateNestedManyWithoutTenantInputObjectSchema } from './lifecycle_versionCreateNestedManyWithoutTenantInput.schema';
import { mfa_challengeCreateNestedManyWithoutTenantInputObjectSchema as mfa_challengeCreateNestedManyWithoutTenantInputObjectSchema } from './mfa_challengeCreateNestedManyWithoutTenantInput.schema';
import { mfa_configCreateNestedManyWithoutTenantInputObjectSchema as mfa_configCreateNestedManyWithoutTenantInputObjectSchema } from './mfa_configCreateNestedManyWithoutTenantInput.schema';
import { organizational_unitCreateNestedManyWithoutTenantInputObjectSchema as organizational_unitCreateNestedManyWithoutTenantInputObjectSchema } from './organizational_unitCreateNestedManyWithoutTenantInput.schema';
import { outboxCreateNestedManyWithoutTenantInputObjectSchema as outboxCreateNestedManyWithoutTenantInputObjectSchema } from './outboxCreateNestedManyWithoutTenantInput.schema';
import { password_historyCreateNestedManyWithoutTenantInputObjectSchema as password_historyCreateNestedManyWithoutTenantInputObjectSchema } from './password_historyCreateNestedManyWithoutTenantInput.schema';
import { PermissionDecisionLogCreateNestedManyWithoutTenantInputObjectSchema as PermissionDecisionLogCreateNestedManyWithoutTenantInputObjectSchema } from './PermissionDecisionLogCreateNestedManyWithoutTenantInput.schema';
import { PrincipalCreateNestedManyWithoutTenantInputObjectSchema as PrincipalCreateNestedManyWithoutTenantInputObjectSchema } from './PrincipalCreateNestedManyWithoutTenantInput.schema';
import { principal_groupCreateNestedManyWithoutTenantInputObjectSchema as principal_groupCreateNestedManyWithoutTenantInputObjectSchema } from './principal_groupCreateNestedManyWithoutTenantInput.schema';
import { principal_locale_overrideCreateNestedManyWithoutTenantInputObjectSchema as principal_locale_overrideCreateNestedManyWithoutTenantInputObjectSchema } from './principal_locale_overrideCreateNestedManyWithoutTenantInput.schema';
import { principal_ouCreateNestedManyWithoutTenantInputObjectSchema as principal_ouCreateNestedManyWithoutTenantInputObjectSchema } from './principal_ouCreateNestedManyWithoutTenantInput.schema';
import { PrincipalProfileCreateNestedManyWithoutTenantInputObjectSchema as PrincipalProfileCreateNestedManyWithoutTenantInputObjectSchema } from './PrincipalProfileCreateNestedManyWithoutTenantInput.schema';
import { principal_roleCreateNestedManyWithoutTenantInputObjectSchema as principal_roleCreateNestedManyWithoutTenantInputObjectSchema } from './principal_roleCreateNestedManyWithoutTenantInput.schema';
import { principal_workspace_accessCreateNestedManyWithoutTenantInputObjectSchema as principal_workspace_accessCreateNestedManyWithoutTenantInputObjectSchema } from './principal_workspace_accessCreateNestedManyWithoutTenantInput.schema';
import { RoleCreateNestedManyWithoutTenantInputObjectSchema as RoleCreateNestedManyWithoutTenantInputObjectSchema } from './RoleCreateNestedManyWithoutTenantInput.schema';
import { security_eventCreateNestedManyWithoutTenantInputObjectSchema as security_eventCreateNestedManyWithoutTenantInputObjectSchema } from './security_eventCreateNestedManyWithoutTenantInput.schema';
import { sms_otp_instanceCreateNestedManyWithoutTenantInputObjectSchema as sms_otp_instanceCreateNestedManyWithoutTenantInputObjectSchema } from './sms_otp_instanceCreateNestedManyWithoutTenantInput.schema';
import { system_configCreateNestedManyWithoutTenantInputObjectSchema as system_configCreateNestedManyWithoutTenantInputObjectSchema } from './system_configCreateNestedManyWithoutTenantInput.schema';
import { tenant_locale_policyCreateNestedManyWithoutTenantInputObjectSchema as tenant_locale_policyCreateNestedManyWithoutTenantInputObjectSchema } from './tenant_locale_policyCreateNestedManyWithoutTenantInput.schema';
import { tenant_module_subscriptionCreateNestedManyWithoutTenantInputObjectSchema as tenant_module_subscriptionCreateNestedManyWithoutTenantInputObjectSchema } from './tenant_module_subscriptionCreateNestedManyWithoutTenantInput.schema';
import { TenantProfileCreateNestedOneWithoutTenantInputObjectSchema as TenantProfileCreateNestedOneWithoutTenantInputObjectSchema } from './TenantProfileCreateNestedOneWithoutTenantInput.schema';
import { totp_instanceCreateNestedManyWithoutTenantInputObjectSchema as totp_instanceCreateNestedManyWithoutTenantInputObjectSchema } from './totp_instanceCreateNestedManyWithoutTenantInput.schema';
import { trusted_deviceCreateNestedManyWithoutTenantInputObjectSchema as trusted_deviceCreateNestedManyWithoutTenantInputObjectSchema } from './trusted_deviceCreateNestedManyWithoutTenantInput.schema';
import { webauthn_credentialCreateNestedManyWithoutTenantInputObjectSchema as webauthn_credentialCreateNestedManyWithoutTenantInputObjectSchema } from './webauthn_credentialCreateNestedManyWithoutTenantInput.schema';
import { workflow_instanceCreateNestedManyWithoutTenantInputObjectSchema as workflow_instanceCreateNestedManyWithoutTenantInputObjectSchema } from './workflow_instanceCreateNestedManyWithoutTenantInput.schema';
import { workflow_transitionCreateNestedManyWithoutTenantInputObjectSchema as workflow_transitionCreateNestedManyWithoutTenantInputObjectSchema } from './workflow_transitionCreateNestedManyWithoutTenantInput.schema';
import { workspace_featureCreateNestedManyWithoutTenantInputObjectSchema as workspace_featureCreateNestedManyWithoutTenantInputObjectSchema } from './workspace_featureCreateNestedManyWithoutTenantInput.schema';
import { workspace_usage_metricCreateNestedManyWithoutTenantInputObjectSchema as workspace_usage_metricCreateNestedManyWithoutTenantInputObjectSchema } from './workspace_usage_metricCreateNestedManyWithoutTenantInput.schema';
import { approval_sla_policyCreateNestedManyWithoutTenantInputObjectSchema as approval_sla_policyCreateNestedManyWithoutTenantInputObjectSchema } from './approval_sla_policyCreateNestedManyWithoutTenantInput.schema';
import { approval_templateCreateNestedManyWithoutTenantInputObjectSchema as approval_templateCreateNestedManyWithoutTenantInputObjectSchema } from './approval_templateCreateNestedManyWithoutTenantInput.schema';
import { approval_template_ruleCreateNestedManyWithoutTenantInputObjectSchema as approval_template_ruleCreateNestedManyWithoutTenantInputObjectSchema } from './approval_template_ruleCreateNestedManyWithoutTenantInput.schema';
import { approval_template_stageCreateNestedManyWithoutTenantInputObjectSchema as approval_template_stageCreateNestedManyWithoutTenantInputObjectSchema } from './approval_template_stageCreateNestedManyWithoutTenantInput.schema';
import { entityCreateNestedManyWithoutTenantInputObjectSchema as entityCreateNestedManyWithoutTenantInputObjectSchema } from './entityCreateNestedManyWithoutTenantInput.schema';
import { entity_compiledCreateNestedManyWithoutTenantInputObjectSchema as entity_compiledCreateNestedManyWithoutTenantInputObjectSchema } from './entity_compiledCreateNestedManyWithoutTenantInput.schema';
import { entity_compiled_overlayCreateNestedManyWithoutTenantInputObjectSchema as entity_compiled_overlayCreateNestedManyWithoutTenantInputObjectSchema } from './entity_compiled_overlayCreateNestedManyWithoutTenantInput.schema';
import { entity_lifecycleCreateNestedManyWithoutTenantInputObjectSchema as entity_lifecycleCreateNestedManyWithoutTenantInputObjectSchema } from './entity_lifecycleCreateNestedManyWithoutTenantInput.schema';
import { entity_lifecycle_route_compiledCreateNestedManyWithoutTenantInputObjectSchema as entity_lifecycle_route_compiledCreateNestedManyWithoutTenantInputObjectSchema } from './entity_lifecycle_route_compiledCreateNestedManyWithoutTenantInput.schema';
import { entity_policyCreateNestedManyWithoutTenantInputObjectSchema as entity_policyCreateNestedManyWithoutTenantInputObjectSchema } from './entity_policyCreateNestedManyWithoutTenantInput.schema';
import { entity_versionCreateNestedManyWithoutTenantInputObjectSchema as entity_versionCreateNestedManyWithoutTenantInputObjectSchema } from './entity_versionCreateNestedManyWithoutTenantInput.schema';
import { fieldCreateNestedManyWithoutTenantInputObjectSchema as fieldCreateNestedManyWithoutTenantInputObjectSchema } from './fieldCreateNestedManyWithoutTenantInput.schema';
import { field_security_policyCreateNestedManyWithoutTenantInputObjectSchema as field_security_policyCreateNestedManyWithoutTenantInputObjectSchema } from './field_security_policyCreateNestedManyWithoutTenantInput.schema';
import { index_defCreateNestedManyWithoutTenantInputObjectSchema as index_defCreateNestedManyWithoutTenantInputObjectSchema } from './index_defCreateNestedManyWithoutTenantInput.schema';
import { meta_lifecycleCreateNestedManyWithoutTenantInputObjectSchema as meta_lifecycleCreateNestedManyWithoutTenantInputObjectSchema } from './meta_lifecycleCreateNestedManyWithoutTenantInput.schema';
import { lifecycle_stateCreateNestedManyWithoutTenantInputObjectSchema as lifecycle_stateCreateNestedManyWithoutTenantInputObjectSchema } from './lifecycle_stateCreateNestedManyWithoutTenantInput.schema';
import { lifecycle_timer_policyCreateNestedManyWithoutTenantInputObjectSchema as lifecycle_timer_policyCreateNestedManyWithoutTenantInputObjectSchema } from './lifecycle_timer_policyCreateNestedManyWithoutTenantInput.schema';
import { lifecycle_transitionCreateNestedManyWithoutTenantInputObjectSchema as lifecycle_transitionCreateNestedManyWithoutTenantInputObjectSchema } from './lifecycle_transitionCreateNestedManyWithoutTenantInput.schema';
import { lifecycle_transition_gateCreateNestedManyWithoutTenantInputObjectSchema as lifecycle_transition_gateCreateNestedManyWithoutTenantInputObjectSchema } from './lifecycle_transition_gateCreateNestedManyWithoutTenantInput.schema';
import { overlayCreateNestedManyWithoutTenantInputObjectSchema as overlayCreateNestedManyWithoutTenantInputObjectSchema } from './overlayCreateNestedManyWithoutTenantInput.schema';
import { overlay_changeCreateNestedManyWithoutTenantInputObjectSchema as overlay_changeCreateNestedManyWithoutTenantInputObjectSchema } from './overlay_changeCreateNestedManyWithoutTenantInput.schema';
import { PermissionPolicyCreateNestedManyWithoutTenantInputObjectSchema as PermissionPolicyCreateNestedManyWithoutTenantInputObjectSchema } from './PermissionPolicyCreateNestedManyWithoutTenantInput.schema';
import { PermissionPolicyCompiledCreateNestedManyWithoutTenantInputObjectSchema as PermissionPolicyCompiledCreateNestedManyWithoutTenantInputObjectSchema } from './PermissionPolicyCompiledCreateNestedManyWithoutTenantInput.schema';
import { PermissionPolicyVersionCreateNestedManyWithoutTenantInputObjectSchema as PermissionPolicyVersionCreateNestedManyWithoutTenantInputObjectSchema } from './PermissionPolicyVersionCreateNestedManyWithoutTenantInput.schema';
import { PermissionRuleCreateNestedManyWithoutTenantInputObjectSchema as PermissionRuleCreateNestedManyWithoutTenantInputObjectSchema } from './PermissionRuleCreateNestedManyWithoutTenantInput.schema';
import { PermissionRuleOperationCreateNestedManyWithoutTenantInputObjectSchema as PermissionRuleOperationCreateNestedManyWithoutTenantInputObjectSchema } from './PermissionRuleOperationCreateNestedManyWithoutTenantInput.schema';
import { relationCreateNestedManyWithoutTenantInputObjectSchema as relationCreateNestedManyWithoutTenantInputObjectSchema } from './relationCreateNestedManyWithoutTenantInput.schema';
import { dashboard_widgetCreateNestedManyWithoutTenantInputObjectSchema as dashboard_widgetCreateNestedManyWithoutTenantInputObjectSchema } from './dashboard_widgetCreateNestedManyWithoutTenantInput.schema';
import { notificationCreateNestedManyWithoutTenantInputObjectSchema as notificationCreateNestedManyWithoutTenantInputObjectSchema } from './notificationCreateNestedManyWithoutTenantInput.schema';
import { notification_preferenceCreateNestedManyWithoutTenantInputObjectSchema as notification_preferenceCreateNestedManyWithoutTenantInputObjectSchema } from './notification_preferenceCreateNestedManyWithoutTenantInput.schema';
import { recent_activityCreateNestedManyWithoutTenantInputObjectSchema as recent_activityCreateNestedManyWithoutTenantInputObjectSchema } from './recent_activityCreateNestedManyWithoutTenantInput.schema';
import { saved_viewCreateNestedManyWithoutTenantInputObjectSchema as saved_viewCreateNestedManyWithoutTenantInputObjectSchema } from './saved_viewCreateNestedManyWithoutTenantInput.schema';
import { search_historyCreateNestedManyWithoutTenantInputObjectSchema as search_historyCreateNestedManyWithoutTenantInputObjectSchema } from './search_historyCreateNestedManyWithoutTenantInput.schema';
import { user_preferenceCreateNestedManyWithoutTenantInputObjectSchema as user_preferenceCreateNestedManyWithoutTenantInputObjectSchema } from './user_preferenceCreateNestedManyWithoutTenantInput.schema'

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
  address: z.lazy(() => addressCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  address_link: z.lazy(() => address_linkCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  approval_comment: z.lazy(() => approval_commentCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  approval_definition: z.lazy(() => approval_definitionCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  approval_instance: z.lazy(() => approval_instanceCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  approval_task: z.lazy(() => approval_taskCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  attachment: z.lazy(() => attachmentCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  audit_log: z.lazy(() => audit_logCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  contact_phone: z.lazy(() => contact_phoneCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  contact_point: z.lazy(() => contact_pointCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  document: z.lazy(() => documentCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  email_otp_instance: z.lazy(() => email_otp_instanceCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  entitlement: z.lazy(() => entitlementCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  entity_tag: z.lazy(() => entity_tagCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  feature_flag: z.lazy(() => feature_flagCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  field_access_log: z.lazy(() => field_access_logCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  groupMembers: z.lazy(() => GroupMemberCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  idpIdentities: z.lazy(() => IdpIdentityCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  job: z.lazy(() => jobCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  job_run: z.lazy(() => job_runCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  lifecycle: z.lazy(() => core_lifecycleCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  lifecycle_version: z.lazy(() => lifecycle_versionCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  mfa_challenge: z.lazy(() => mfa_challengeCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  mfa_config: z.lazy(() => mfa_configCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  organizational_unit: z.lazy(() => organizational_unitCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  outbox: z.lazy(() => outboxCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  password_history: z.lazy(() => password_historyCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  permission_decision_log: z.lazy(() => PermissionDecisionLogCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  principals: z.lazy(() => PrincipalCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  principal_group: z.lazy(() => principal_groupCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  principal_locale_override: z.lazy(() => principal_locale_overrideCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  principal_ou: z.lazy(() => principal_ouCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  principalProfiles: z.lazy(() => PrincipalProfileCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  principal_role: z.lazy(() => principal_roleCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  principal_workspace_access: z.lazy(() => principal_workspace_accessCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  roles: z.lazy(() => RoleCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  security_event: z.lazy(() => security_eventCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  sms_otp_instance: z.lazy(() => sms_otp_instanceCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  system_config: z.lazy(() => system_configCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  tenant_locale_policy: z.lazy(() => tenant_locale_policyCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  tenant_module_subscription: z.lazy(() => tenant_module_subscriptionCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  tenantProfile: z.lazy(() => TenantProfileCreateNestedOneWithoutTenantInputObjectSchema).optional(),
  totp_instance: z.lazy(() => totp_instanceCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  trusted_device: z.lazy(() => trusted_deviceCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  webauthn_credential: z.lazy(() => webauthn_credentialCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  workflow_instance: z.lazy(() => workflow_instanceCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  workflow_transition: z.lazy(() => workflow_transitionCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  workspace_feature: z.lazy(() => workspace_featureCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  workspace_usage_metric: z.lazy(() => workspace_usage_metricCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  approval_sla_policy: z.lazy(() => approval_sla_policyCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  approval_template: z.lazy(() => approval_templateCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  approval_template_rule: z.lazy(() => approval_template_ruleCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  approval_template_stage: z.lazy(() => approval_template_stageCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  entity: z.lazy(() => entityCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  entity_compiled: z.lazy(() => entity_compiledCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  entity_compiled_overlay: z.lazy(() => entity_compiled_overlayCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  entity_lifecycle: z.lazy(() => entity_lifecycleCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  entity_lifecycle_route_compiled: z.lazy(() => entity_lifecycle_route_compiledCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  entity_policy: z.lazy(() => entity_policyCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  entity_version: z.lazy(() => entity_versionCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  field: z.lazy(() => fieldCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  field_security_policy: z.lazy(() => field_security_policyCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  index_def: z.lazy(() => index_defCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  meta_lifecycle: z.lazy(() => meta_lifecycleCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  lifecycle_state: z.lazy(() => lifecycle_stateCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  lifecycle_timer_policy: z.lazy(() => lifecycle_timer_policyCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  lifecycle_transition: z.lazy(() => lifecycle_transitionCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  lifecycle_transition_gate: z.lazy(() => lifecycle_transition_gateCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  overlay: z.lazy(() => overlayCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  overlay_change: z.lazy(() => overlay_changeCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  permission_policy: z.lazy(() => PermissionPolicyCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  permission_policy_compiled: z.lazy(() => PermissionPolicyCompiledCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  permission_policy_version: z.lazy(() => PermissionPolicyVersionCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  permission_rule: z.lazy(() => PermissionRuleCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  permission_rule_operation: z.lazy(() => PermissionRuleOperationCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  relation: z.lazy(() => relationCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  dashboard_widget: z.lazy(() => dashboard_widgetCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  notification: z.lazy(() => notificationCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  notification_preference: z.lazy(() => notification_preferenceCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  recent_activity: z.lazy(() => recent_activityCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  saved_view: z.lazy(() => saved_viewCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  search_history: z.lazy(() => search_historyCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  user_preference: z.lazy(() => user_preferenceCreateNestedManyWithoutTenantInputObjectSchema).optional()
}).strict();
export const TenantCreateInputObjectSchema: z.ZodType<Prisma.TenantCreateInput> = makeSchema() as unknown as z.ZodType<Prisma.TenantCreateInput>;
export const TenantCreateInputObjectZodSchema = makeSchema();
