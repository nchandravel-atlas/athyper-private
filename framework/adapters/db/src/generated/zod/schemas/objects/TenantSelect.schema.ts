import * as z from 'zod';
import type { Prisma } from '@prisma/client';
import { addressFindManySchema as addressFindManySchema } from '../findManyaddress.schema';
import { address_linkFindManySchema as address_linkFindManySchema } from '../findManyaddress_link.schema';
import { approval_commentFindManySchema as approval_commentFindManySchema } from '../findManyapproval_comment.schema';
import { approval_definitionFindManySchema as approval_definitionFindManySchema } from '../findManyapproval_definition.schema';
import { approval_instanceFindManySchema as approval_instanceFindManySchema } from '../findManyapproval_instance.schema';
import { approval_taskFindManySchema as approval_taskFindManySchema } from '../findManyapproval_task.schema';
import { attachmentFindManySchema as attachmentFindManySchema } from '../findManyattachment.schema';
import { audit_logFindManySchema as audit_logFindManySchema } from '../findManyaudit_log.schema';
import { contact_phoneFindManySchema as contact_phoneFindManySchema } from '../findManycontact_phone.schema';
import { contact_pointFindManySchema as contact_pointFindManySchema } from '../findManycontact_point.schema';
import { documentFindManySchema as documentFindManySchema } from '../findManydocument.schema';
import { email_otp_instanceFindManySchema as email_otp_instanceFindManySchema } from '../findManyemail_otp_instance.schema';
import { entitlementFindManySchema as entitlementFindManySchema } from '../findManyentitlement.schema';
import { entity_tagFindManySchema as entity_tagFindManySchema } from '../findManyentity_tag.schema';
import { feature_flagFindManySchema as feature_flagFindManySchema } from '../findManyfeature_flag.schema';
import { field_access_logFindManySchema as field_access_logFindManySchema } from '../findManyfield_access_log.schema';
import { GroupMemberFindManySchema as GroupMemberFindManySchema } from '../findManyGroupMember.schema';
import { IdpIdentityFindManySchema as IdpIdentityFindManySchema } from '../findManyIdpIdentity.schema';
import { jobFindManySchema as jobFindManySchema } from '../findManyjob.schema';
import { job_runFindManySchema as job_runFindManySchema } from '../findManyjob_run.schema';
import { core_lifecycleFindManySchema as core_lifecycleFindManySchema } from '../findManycore_lifecycle.schema';
import { lifecycle_versionFindManySchema as lifecycle_versionFindManySchema } from '../findManylifecycle_version.schema';
import { mfa_challengeFindManySchema as mfa_challengeFindManySchema } from '../findManymfa_challenge.schema';
import { mfa_configFindManySchema as mfa_configFindManySchema } from '../findManymfa_config.schema';
import { organizational_unitFindManySchema as organizational_unitFindManySchema } from '../findManyorganizational_unit.schema';
import { outboxFindManySchema as outboxFindManySchema } from '../findManyoutbox.schema';
import { password_historyFindManySchema as password_historyFindManySchema } from '../findManypassword_history.schema';
import { PermissionDecisionLogFindManySchema as PermissionDecisionLogFindManySchema } from '../findManyPermissionDecisionLog.schema';
import { PrincipalFindManySchema as PrincipalFindManySchema } from '../findManyPrincipal.schema';
import { principal_groupFindManySchema as principal_groupFindManySchema } from '../findManyprincipal_group.schema';
import { principal_locale_overrideFindManySchema as principal_locale_overrideFindManySchema } from '../findManyprincipal_locale_override.schema';
import { principal_ouFindManySchema as principal_ouFindManySchema } from '../findManyprincipal_ou.schema';
import { PrincipalProfileFindManySchema as PrincipalProfileFindManySchema } from '../findManyPrincipalProfile.schema';
import { principal_roleFindManySchema as principal_roleFindManySchema } from '../findManyprincipal_role.schema';
import { principal_workspace_accessFindManySchema as principal_workspace_accessFindManySchema } from '../findManyprincipal_workspace_access.schema';
import { RoleFindManySchema as RoleFindManySchema } from '../findManyRole.schema';
import { security_eventFindManySchema as security_eventFindManySchema } from '../findManysecurity_event.schema';
import { sms_otp_instanceFindManySchema as sms_otp_instanceFindManySchema } from '../findManysms_otp_instance.schema';
import { system_configFindManySchema as system_configFindManySchema } from '../findManysystem_config.schema';
import { tenant_locale_policyFindManySchema as tenant_locale_policyFindManySchema } from '../findManytenant_locale_policy.schema';
import { tenant_module_subscriptionFindManySchema as tenant_module_subscriptionFindManySchema } from '../findManytenant_module_subscription.schema';
import { TenantProfileArgsObjectSchema as TenantProfileArgsObjectSchema } from './TenantProfileArgs.schema';
import { totp_instanceFindManySchema as totp_instanceFindManySchema } from '../findManytotp_instance.schema';
import { trusted_deviceFindManySchema as trusted_deviceFindManySchema } from '../findManytrusted_device.schema';
import { webauthn_credentialFindManySchema as webauthn_credentialFindManySchema } from '../findManywebauthn_credential.schema';
import { workflow_instanceFindManySchema as workflow_instanceFindManySchema } from '../findManyworkflow_instance.schema';
import { workflow_transitionFindManySchema as workflow_transitionFindManySchema } from '../findManyworkflow_transition.schema';
import { workspace_featureFindManySchema as workspace_featureFindManySchema } from '../findManyworkspace_feature.schema';
import { workspace_usage_metricFindManySchema as workspace_usage_metricFindManySchema } from '../findManyworkspace_usage_metric.schema';
import { approval_sla_policyFindManySchema as approval_sla_policyFindManySchema } from '../findManyapproval_sla_policy.schema';
import { approval_templateFindManySchema as approval_templateFindManySchema } from '../findManyapproval_template.schema';
import { approval_template_ruleFindManySchema as approval_template_ruleFindManySchema } from '../findManyapproval_template_rule.schema';
import { approval_template_stageFindManySchema as approval_template_stageFindManySchema } from '../findManyapproval_template_stage.schema';
import { entityFindManySchema as entityFindManySchema } from '../findManyentity.schema';
import { entity_compiledFindManySchema as entity_compiledFindManySchema } from '../findManyentity_compiled.schema';
import { entity_compiled_overlayFindManySchema as entity_compiled_overlayFindManySchema } from '../findManyentity_compiled_overlay.schema';
import { entity_lifecycleFindManySchema as entity_lifecycleFindManySchema } from '../findManyentity_lifecycle.schema';
import { entity_lifecycle_route_compiledFindManySchema as entity_lifecycle_route_compiledFindManySchema } from '../findManyentity_lifecycle_route_compiled.schema';
import { entity_policyFindManySchema as entity_policyFindManySchema } from '../findManyentity_policy.schema';
import { entity_versionFindManySchema as entity_versionFindManySchema } from '../findManyentity_version.schema';
import { fieldFindManySchema as fieldFindManySchema } from '../findManyfield.schema';
import { field_security_policyFindManySchema as field_security_policyFindManySchema } from '../findManyfield_security_policy.schema';
import { index_defFindManySchema as index_defFindManySchema } from '../findManyindex_def.schema';
import { meta_lifecycleFindManySchema as meta_lifecycleFindManySchema } from '../findManymeta_lifecycle.schema';
import { lifecycle_stateFindManySchema as lifecycle_stateFindManySchema } from '../findManylifecycle_state.schema';
import { lifecycle_timer_policyFindManySchema as lifecycle_timer_policyFindManySchema } from '../findManylifecycle_timer_policy.schema';
import { lifecycle_transitionFindManySchema as lifecycle_transitionFindManySchema } from '../findManylifecycle_transition.schema';
import { lifecycle_transition_gateFindManySchema as lifecycle_transition_gateFindManySchema } from '../findManylifecycle_transition_gate.schema';
import { overlayFindManySchema as overlayFindManySchema } from '../findManyoverlay.schema';
import { overlay_changeFindManySchema as overlay_changeFindManySchema } from '../findManyoverlay_change.schema';
import { PermissionPolicyFindManySchema as PermissionPolicyFindManySchema } from '../findManyPermissionPolicy.schema';
import { PermissionPolicyCompiledFindManySchema as PermissionPolicyCompiledFindManySchema } from '../findManyPermissionPolicyCompiled.schema';
import { PermissionPolicyVersionFindManySchema as PermissionPolicyVersionFindManySchema } from '../findManyPermissionPolicyVersion.schema';
import { PermissionRuleFindManySchema as PermissionRuleFindManySchema } from '../findManyPermissionRule.schema';
import { PermissionRuleOperationFindManySchema as PermissionRuleOperationFindManySchema } from '../findManyPermissionRuleOperation.schema';
import { relationFindManySchema as relationFindManySchema } from '../findManyrelation.schema';
import { dashboard_widgetFindManySchema as dashboard_widgetFindManySchema } from '../findManydashboard_widget.schema';
import { notificationFindManySchema as notificationFindManySchema } from '../findManynotification.schema';
import { notification_preferenceFindManySchema as notification_preferenceFindManySchema } from '../findManynotification_preference.schema';
import { recent_activityFindManySchema as recent_activityFindManySchema } from '../findManyrecent_activity.schema';
import { saved_viewFindManySchema as saved_viewFindManySchema } from '../findManysaved_view.schema';
import { search_historyFindManySchema as search_historyFindManySchema } from '../findManysearch_history.schema';
import { user_preferenceFindManySchema as user_preferenceFindManySchema } from '../findManyuser_preference.schema';
import { TenantCountOutputTypeArgsObjectSchema as TenantCountOutputTypeArgsObjectSchema } from './TenantCountOutputTypeArgs.schema'

const makeSchema = () => z.object({
  id: z.boolean().optional(),
  code: z.boolean().optional(),
  name: z.boolean().optional(),
  display_name: z.boolean().optional(),
  realm_key: z.boolean().optional(),
  status: z.boolean().optional(),
  region: z.boolean().optional(),
  subscription: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  createdBy: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  updatedBy: z.boolean().optional(),
  address: z.union([z.boolean(), z.lazy(() => addressFindManySchema)]).optional(),
  address_link: z.union([z.boolean(), z.lazy(() => address_linkFindManySchema)]).optional(),
  approval_comment: z.union([z.boolean(), z.lazy(() => approval_commentFindManySchema)]).optional(),
  approval_definition: z.union([z.boolean(), z.lazy(() => approval_definitionFindManySchema)]).optional(),
  approval_instance: z.union([z.boolean(), z.lazy(() => approval_instanceFindManySchema)]).optional(),
  approval_task: z.union([z.boolean(), z.lazy(() => approval_taskFindManySchema)]).optional(),
  attachment: z.union([z.boolean(), z.lazy(() => attachmentFindManySchema)]).optional(),
  audit_log: z.union([z.boolean(), z.lazy(() => audit_logFindManySchema)]).optional(),
  contact_phone: z.union([z.boolean(), z.lazy(() => contact_phoneFindManySchema)]).optional(),
  contact_point: z.union([z.boolean(), z.lazy(() => contact_pointFindManySchema)]).optional(),
  document: z.union([z.boolean(), z.lazy(() => documentFindManySchema)]).optional(),
  email_otp_instance: z.union([z.boolean(), z.lazy(() => email_otp_instanceFindManySchema)]).optional(),
  entitlement: z.union([z.boolean(), z.lazy(() => entitlementFindManySchema)]).optional(),
  entity_tag: z.union([z.boolean(), z.lazy(() => entity_tagFindManySchema)]).optional(),
  feature_flag: z.union([z.boolean(), z.lazy(() => feature_flagFindManySchema)]).optional(),
  field_access_log: z.union([z.boolean(), z.lazy(() => field_access_logFindManySchema)]).optional(),
  groupMembers: z.union([z.boolean(), z.lazy(() => GroupMemberFindManySchema)]).optional(),
  idpIdentities: z.union([z.boolean(), z.lazy(() => IdpIdentityFindManySchema)]).optional(),
  job: z.union([z.boolean(), z.lazy(() => jobFindManySchema)]).optional(),
  job_run: z.union([z.boolean(), z.lazy(() => job_runFindManySchema)]).optional(),
  lifecycle: z.union([z.boolean(), z.lazy(() => core_lifecycleFindManySchema)]).optional(),
  lifecycle_version: z.union([z.boolean(), z.lazy(() => lifecycle_versionFindManySchema)]).optional(),
  mfa_challenge: z.union([z.boolean(), z.lazy(() => mfa_challengeFindManySchema)]).optional(),
  mfa_config: z.union([z.boolean(), z.lazy(() => mfa_configFindManySchema)]).optional(),
  organizational_unit: z.union([z.boolean(), z.lazy(() => organizational_unitFindManySchema)]).optional(),
  outbox: z.union([z.boolean(), z.lazy(() => outboxFindManySchema)]).optional(),
  password_history: z.union([z.boolean(), z.lazy(() => password_historyFindManySchema)]).optional(),
  permission_decision_log: z.union([z.boolean(), z.lazy(() => PermissionDecisionLogFindManySchema)]).optional(),
  principals: z.union([z.boolean(), z.lazy(() => PrincipalFindManySchema)]).optional(),
  principal_group: z.union([z.boolean(), z.lazy(() => principal_groupFindManySchema)]).optional(),
  principal_locale_override: z.union([z.boolean(), z.lazy(() => principal_locale_overrideFindManySchema)]).optional(),
  principal_ou: z.union([z.boolean(), z.lazy(() => principal_ouFindManySchema)]).optional(),
  principalProfiles: z.union([z.boolean(), z.lazy(() => PrincipalProfileFindManySchema)]).optional(),
  principal_role: z.union([z.boolean(), z.lazy(() => principal_roleFindManySchema)]).optional(),
  principal_workspace_access: z.union([z.boolean(), z.lazy(() => principal_workspace_accessFindManySchema)]).optional(),
  roles: z.union([z.boolean(), z.lazy(() => RoleFindManySchema)]).optional(),
  security_event: z.union([z.boolean(), z.lazy(() => security_eventFindManySchema)]).optional(),
  sms_otp_instance: z.union([z.boolean(), z.lazy(() => sms_otp_instanceFindManySchema)]).optional(),
  system_config: z.union([z.boolean(), z.lazy(() => system_configFindManySchema)]).optional(),
  tenant_locale_policy: z.union([z.boolean(), z.lazy(() => tenant_locale_policyFindManySchema)]).optional(),
  tenant_module_subscription: z.union([z.boolean(), z.lazy(() => tenant_module_subscriptionFindManySchema)]).optional(),
  tenantProfile: z.union([z.boolean(), z.lazy(() => TenantProfileArgsObjectSchema)]).optional(),
  totp_instance: z.union([z.boolean(), z.lazy(() => totp_instanceFindManySchema)]).optional(),
  trusted_device: z.union([z.boolean(), z.lazy(() => trusted_deviceFindManySchema)]).optional(),
  webauthn_credential: z.union([z.boolean(), z.lazy(() => webauthn_credentialFindManySchema)]).optional(),
  workflow_instance: z.union([z.boolean(), z.lazy(() => workflow_instanceFindManySchema)]).optional(),
  workflow_transition: z.union([z.boolean(), z.lazy(() => workflow_transitionFindManySchema)]).optional(),
  workspace_feature: z.union([z.boolean(), z.lazy(() => workspace_featureFindManySchema)]).optional(),
  workspace_usage_metric: z.union([z.boolean(), z.lazy(() => workspace_usage_metricFindManySchema)]).optional(),
  approval_sla_policy: z.union([z.boolean(), z.lazy(() => approval_sla_policyFindManySchema)]).optional(),
  approval_template: z.union([z.boolean(), z.lazy(() => approval_templateFindManySchema)]).optional(),
  approval_template_rule: z.union([z.boolean(), z.lazy(() => approval_template_ruleFindManySchema)]).optional(),
  approval_template_stage: z.union([z.boolean(), z.lazy(() => approval_template_stageFindManySchema)]).optional(),
  entity: z.union([z.boolean(), z.lazy(() => entityFindManySchema)]).optional(),
  entity_compiled: z.union([z.boolean(), z.lazy(() => entity_compiledFindManySchema)]).optional(),
  entity_compiled_overlay: z.union([z.boolean(), z.lazy(() => entity_compiled_overlayFindManySchema)]).optional(),
  entity_lifecycle: z.union([z.boolean(), z.lazy(() => entity_lifecycleFindManySchema)]).optional(),
  entity_lifecycle_route_compiled: z.union([z.boolean(), z.lazy(() => entity_lifecycle_route_compiledFindManySchema)]).optional(),
  entity_policy: z.union([z.boolean(), z.lazy(() => entity_policyFindManySchema)]).optional(),
  entity_version: z.union([z.boolean(), z.lazy(() => entity_versionFindManySchema)]).optional(),
  field: z.union([z.boolean(), z.lazy(() => fieldFindManySchema)]).optional(),
  field_security_policy: z.union([z.boolean(), z.lazy(() => field_security_policyFindManySchema)]).optional(),
  index_def: z.union([z.boolean(), z.lazy(() => index_defFindManySchema)]).optional(),
  meta_lifecycle: z.union([z.boolean(), z.lazy(() => meta_lifecycleFindManySchema)]).optional(),
  lifecycle_state: z.union([z.boolean(), z.lazy(() => lifecycle_stateFindManySchema)]).optional(),
  lifecycle_timer_policy: z.union([z.boolean(), z.lazy(() => lifecycle_timer_policyFindManySchema)]).optional(),
  lifecycle_transition: z.union([z.boolean(), z.lazy(() => lifecycle_transitionFindManySchema)]).optional(),
  lifecycle_transition_gate: z.union([z.boolean(), z.lazy(() => lifecycle_transition_gateFindManySchema)]).optional(),
  overlay: z.union([z.boolean(), z.lazy(() => overlayFindManySchema)]).optional(),
  overlay_change: z.union([z.boolean(), z.lazy(() => overlay_changeFindManySchema)]).optional(),
  permission_policy: z.union([z.boolean(), z.lazy(() => PermissionPolicyFindManySchema)]).optional(),
  permission_policy_compiled: z.union([z.boolean(), z.lazy(() => PermissionPolicyCompiledFindManySchema)]).optional(),
  permission_policy_version: z.union([z.boolean(), z.lazy(() => PermissionPolicyVersionFindManySchema)]).optional(),
  permission_rule: z.union([z.boolean(), z.lazy(() => PermissionRuleFindManySchema)]).optional(),
  permission_rule_operation: z.union([z.boolean(), z.lazy(() => PermissionRuleOperationFindManySchema)]).optional(),
  relation: z.union([z.boolean(), z.lazy(() => relationFindManySchema)]).optional(),
  dashboard_widget: z.union([z.boolean(), z.lazy(() => dashboard_widgetFindManySchema)]).optional(),
  notification: z.union([z.boolean(), z.lazy(() => notificationFindManySchema)]).optional(),
  notification_preference: z.union([z.boolean(), z.lazy(() => notification_preferenceFindManySchema)]).optional(),
  recent_activity: z.union([z.boolean(), z.lazy(() => recent_activityFindManySchema)]).optional(),
  saved_view: z.union([z.boolean(), z.lazy(() => saved_viewFindManySchema)]).optional(),
  search_history: z.union([z.boolean(), z.lazy(() => search_historyFindManySchema)]).optional(),
  user_preference: z.union([z.boolean(), z.lazy(() => user_preferenceFindManySchema)]).optional(),
  _count: z.union([z.boolean(), z.lazy(() => TenantCountOutputTypeArgsObjectSchema)]).optional()
}).strict();
export const TenantSelectObjectSchema: z.ZodType<Prisma.TenantSelect> = makeSchema() as unknown as z.ZodType<Prisma.TenantSelect>;
export const TenantSelectObjectZodSchema = makeSchema();
