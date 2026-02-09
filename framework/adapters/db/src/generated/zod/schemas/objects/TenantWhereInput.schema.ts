import * as z from 'zod';
import type { Prisma } from '@prisma/client';
import { UuidFilterObjectSchema as UuidFilterObjectSchema } from './UuidFilter.schema';
import { StringFilterObjectSchema as StringFilterObjectSchema } from './StringFilter.schema';
import { StringNullableFilterObjectSchema as StringNullableFilterObjectSchema } from './StringNullableFilter.schema';
import { DateTimeFilterObjectSchema as DateTimeFilterObjectSchema } from './DateTimeFilter.schema';
import { DateTimeNullableFilterObjectSchema as DateTimeNullableFilterObjectSchema } from './DateTimeNullableFilter.schema';
import { AddressListRelationFilterObjectSchema as AddressListRelationFilterObjectSchema } from './AddressListRelationFilter.schema';
import { Address_linkListRelationFilterObjectSchema as Address_linkListRelationFilterObjectSchema } from './Address_linkListRelationFilter.schema';
import { Approval_commentListRelationFilterObjectSchema as Approval_commentListRelationFilterObjectSchema } from './Approval_commentListRelationFilter.schema';
import { Approval_definitionListRelationFilterObjectSchema as Approval_definitionListRelationFilterObjectSchema } from './Approval_definitionListRelationFilter.schema';
import { Approval_instanceListRelationFilterObjectSchema as Approval_instanceListRelationFilterObjectSchema } from './Approval_instanceListRelationFilter.schema';
import { Approval_taskListRelationFilterObjectSchema as Approval_taskListRelationFilterObjectSchema } from './Approval_taskListRelationFilter.schema';
import { AttachmentListRelationFilterObjectSchema as AttachmentListRelationFilterObjectSchema } from './AttachmentListRelationFilter.schema';
import { Audit_logListRelationFilterObjectSchema as Audit_logListRelationFilterObjectSchema } from './Audit_logListRelationFilter.schema';
import { Contact_phoneListRelationFilterObjectSchema as Contact_phoneListRelationFilterObjectSchema } from './Contact_phoneListRelationFilter.schema';
import { Contact_pointListRelationFilterObjectSchema as Contact_pointListRelationFilterObjectSchema } from './Contact_pointListRelationFilter.schema';
import { DocumentListRelationFilterObjectSchema as DocumentListRelationFilterObjectSchema } from './DocumentListRelationFilter.schema';
import { Email_otp_instanceListRelationFilterObjectSchema as Email_otp_instanceListRelationFilterObjectSchema } from './Email_otp_instanceListRelationFilter.schema';
import { EntitlementListRelationFilterObjectSchema as EntitlementListRelationFilterObjectSchema } from './EntitlementListRelationFilter.schema';
import { Entity_tagListRelationFilterObjectSchema as Entity_tagListRelationFilterObjectSchema } from './Entity_tagListRelationFilter.schema';
import { Feature_flagListRelationFilterObjectSchema as Feature_flagListRelationFilterObjectSchema } from './Feature_flagListRelationFilter.schema';
import { Field_access_logListRelationFilterObjectSchema as Field_access_logListRelationFilterObjectSchema } from './Field_access_logListRelationFilter.schema';
import { GroupMemberListRelationFilterObjectSchema as GroupMemberListRelationFilterObjectSchema } from './GroupMemberListRelationFilter.schema';
import { IdpIdentityListRelationFilterObjectSchema as IdpIdentityListRelationFilterObjectSchema } from './IdpIdentityListRelationFilter.schema';
import { JobListRelationFilterObjectSchema as JobListRelationFilterObjectSchema } from './JobListRelationFilter.schema';
import { Job_runListRelationFilterObjectSchema as Job_runListRelationFilterObjectSchema } from './Job_runListRelationFilter.schema';
import { Core_lifecycleListRelationFilterObjectSchema as Core_lifecycleListRelationFilterObjectSchema } from './Core_lifecycleListRelationFilter.schema';
import { Lifecycle_versionListRelationFilterObjectSchema as Lifecycle_versionListRelationFilterObjectSchema } from './Lifecycle_versionListRelationFilter.schema';
import { Mfa_challengeListRelationFilterObjectSchema as Mfa_challengeListRelationFilterObjectSchema } from './Mfa_challengeListRelationFilter.schema';
import { Mfa_configListRelationFilterObjectSchema as Mfa_configListRelationFilterObjectSchema } from './Mfa_configListRelationFilter.schema';
import { Organizational_unitListRelationFilterObjectSchema as Organizational_unitListRelationFilterObjectSchema } from './Organizational_unitListRelationFilter.schema';
import { OutboxListRelationFilterObjectSchema as OutboxListRelationFilterObjectSchema } from './OutboxListRelationFilter.schema';
import { Password_historyListRelationFilterObjectSchema as Password_historyListRelationFilterObjectSchema } from './Password_historyListRelationFilter.schema';
import { PermissionDecisionLogListRelationFilterObjectSchema as PermissionDecisionLogListRelationFilterObjectSchema } from './PermissionDecisionLogListRelationFilter.schema';
import { PrincipalListRelationFilterObjectSchema as PrincipalListRelationFilterObjectSchema } from './PrincipalListRelationFilter.schema';
import { Principal_groupListRelationFilterObjectSchema as Principal_groupListRelationFilterObjectSchema } from './Principal_groupListRelationFilter.schema';
import { Principal_locale_overrideListRelationFilterObjectSchema as Principal_locale_overrideListRelationFilterObjectSchema } from './Principal_locale_overrideListRelationFilter.schema';
import { Principal_ouListRelationFilterObjectSchema as Principal_ouListRelationFilterObjectSchema } from './Principal_ouListRelationFilter.schema';
import { PrincipalProfileListRelationFilterObjectSchema as PrincipalProfileListRelationFilterObjectSchema } from './PrincipalProfileListRelationFilter.schema';
import { Principal_roleListRelationFilterObjectSchema as Principal_roleListRelationFilterObjectSchema } from './Principal_roleListRelationFilter.schema';
import { Principal_workspace_accessListRelationFilterObjectSchema as Principal_workspace_accessListRelationFilterObjectSchema } from './Principal_workspace_accessListRelationFilter.schema';
import { RoleListRelationFilterObjectSchema as RoleListRelationFilterObjectSchema } from './RoleListRelationFilter.schema';
import { Security_eventListRelationFilterObjectSchema as Security_eventListRelationFilterObjectSchema } from './Security_eventListRelationFilter.schema';
import { Sms_otp_instanceListRelationFilterObjectSchema as Sms_otp_instanceListRelationFilterObjectSchema } from './Sms_otp_instanceListRelationFilter.schema';
import { System_configListRelationFilterObjectSchema as System_configListRelationFilterObjectSchema } from './System_configListRelationFilter.schema';
import { Tenant_locale_policyListRelationFilterObjectSchema as Tenant_locale_policyListRelationFilterObjectSchema } from './Tenant_locale_policyListRelationFilter.schema';
import { Tenant_module_subscriptionListRelationFilterObjectSchema as Tenant_module_subscriptionListRelationFilterObjectSchema } from './Tenant_module_subscriptionListRelationFilter.schema';
import { TenantProfileNullableScalarRelationFilterObjectSchema as TenantProfileNullableScalarRelationFilterObjectSchema } from './TenantProfileNullableScalarRelationFilter.schema';
import { TenantProfileWhereInputObjectSchema as TenantProfileWhereInputObjectSchema } from './TenantProfileWhereInput.schema';
import { Totp_instanceListRelationFilterObjectSchema as Totp_instanceListRelationFilterObjectSchema } from './Totp_instanceListRelationFilter.schema';
import { Trusted_deviceListRelationFilterObjectSchema as Trusted_deviceListRelationFilterObjectSchema } from './Trusted_deviceListRelationFilter.schema';
import { Webauthn_credentialListRelationFilterObjectSchema as Webauthn_credentialListRelationFilterObjectSchema } from './Webauthn_credentialListRelationFilter.schema';
import { Workflow_instanceListRelationFilterObjectSchema as Workflow_instanceListRelationFilterObjectSchema } from './Workflow_instanceListRelationFilter.schema';
import { Workflow_transitionListRelationFilterObjectSchema as Workflow_transitionListRelationFilterObjectSchema } from './Workflow_transitionListRelationFilter.schema';
import { Workspace_featureListRelationFilterObjectSchema as Workspace_featureListRelationFilterObjectSchema } from './Workspace_featureListRelationFilter.schema';
import { Workspace_usage_metricListRelationFilterObjectSchema as Workspace_usage_metricListRelationFilterObjectSchema } from './Workspace_usage_metricListRelationFilter.schema';
import { Approval_sla_policyListRelationFilterObjectSchema as Approval_sla_policyListRelationFilterObjectSchema } from './Approval_sla_policyListRelationFilter.schema';
import { Approval_templateListRelationFilterObjectSchema as Approval_templateListRelationFilterObjectSchema } from './Approval_templateListRelationFilter.schema';
import { Approval_template_ruleListRelationFilterObjectSchema as Approval_template_ruleListRelationFilterObjectSchema } from './Approval_template_ruleListRelationFilter.schema';
import { Approval_template_stageListRelationFilterObjectSchema as Approval_template_stageListRelationFilterObjectSchema } from './Approval_template_stageListRelationFilter.schema';
import { EntityListRelationFilterObjectSchema as EntityListRelationFilterObjectSchema } from './EntityListRelationFilter.schema';
import { Entity_compiledListRelationFilterObjectSchema as Entity_compiledListRelationFilterObjectSchema } from './Entity_compiledListRelationFilter.schema';
import { Entity_compiled_overlayListRelationFilterObjectSchema as Entity_compiled_overlayListRelationFilterObjectSchema } from './Entity_compiled_overlayListRelationFilter.schema';
import { Entity_lifecycleListRelationFilterObjectSchema as Entity_lifecycleListRelationFilterObjectSchema } from './Entity_lifecycleListRelationFilter.schema';
import { Entity_lifecycle_route_compiledListRelationFilterObjectSchema as Entity_lifecycle_route_compiledListRelationFilterObjectSchema } from './Entity_lifecycle_route_compiledListRelationFilter.schema';
import { Entity_policyListRelationFilterObjectSchema as Entity_policyListRelationFilterObjectSchema } from './Entity_policyListRelationFilter.schema';
import { Entity_versionListRelationFilterObjectSchema as Entity_versionListRelationFilterObjectSchema } from './Entity_versionListRelationFilter.schema';
import { FieldListRelationFilterObjectSchema as FieldListRelationFilterObjectSchema } from './FieldListRelationFilter.schema';
import { Field_security_policyListRelationFilterObjectSchema as Field_security_policyListRelationFilterObjectSchema } from './Field_security_policyListRelationFilter.schema';
import { Index_defListRelationFilterObjectSchema as Index_defListRelationFilterObjectSchema } from './Index_defListRelationFilter.schema';
import { Meta_lifecycleListRelationFilterObjectSchema as Meta_lifecycleListRelationFilterObjectSchema } from './Meta_lifecycleListRelationFilter.schema';
import { Lifecycle_stateListRelationFilterObjectSchema as Lifecycle_stateListRelationFilterObjectSchema } from './Lifecycle_stateListRelationFilter.schema';
import { Lifecycle_timer_policyListRelationFilterObjectSchema as Lifecycle_timer_policyListRelationFilterObjectSchema } from './Lifecycle_timer_policyListRelationFilter.schema';
import { Lifecycle_transitionListRelationFilterObjectSchema as Lifecycle_transitionListRelationFilterObjectSchema } from './Lifecycle_transitionListRelationFilter.schema';
import { Lifecycle_transition_gateListRelationFilterObjectSchema as Lifecycle_transition_gateListRelationFilterObjectSchema } from './Lifecycle_transition_gateListRelationFilter.schema';
import { OverlayListRelationFilterObjectSchema as OverlayListRelationFilterObjectSchema } from './OverlayListRelationFilter.schema';
import { Overlay_changeListRelationFilterObjectSchema as Overlay_changeListRelationFilterObjectSchema } from './Overlay_changeListRelationFilter.schema';
import { PermissionPolicyListRelationFilterObjectSchema as PermissionPolicyListRelationFilterObjectSchema } from './PermissionPolicyListRelationFilter.schema';
import { PermissionPolicyCompiledListRelationFilterObjectSchema as PermissionPolicyCompiledListRelationFilterObjectSchema } from './PermissionPolicyCompiledListRelationFilter.schema';
import { PermissionPolicyVersionListRelationFilterObjectSchema as PermissionPolicyVersionListRelationFilterObjectSchema } from './PermissionPolicyVersionListRelationFilter.schema';
import { PermissionRuleListRelationFilterObjectSchema as PermissionRuleListRelationFilterObjectSchema } from './PermissionRuleListRelationFilter.schema';
import { PermissionRuleOperationListRelationFilterObjectSchema as PermissionRuleOperationListRelationFilterObjectSchema } from './PermissionRuleOperationListRelationFilter.schema';
import { RelationListRelationFilterObjectSchema as RelationListRelationFilterObjectSchema } from './RelationListRelationFilter.schema';
import { Dashboard_widgetListRelationFilterObjectSchema as Dashboard_widgetListRelationFilterObjectSchema } from './Dashboard_widgetListRelationFilter.schema';
import { NotificationListRelationFilterObjectSchema as NotificationListRelationFilterObjectSchema } from './NotificationListRelationFilter.schema';
import { Notification_preferenceListRelationFilterObjectSchema as Notification_preferenceListRelationFilterObjectSchema } from './Notification_preferenceListRelationFilter.schema';
import { Recent_activityListRelationFilterObjectSchema as Recent_activityListRelationFilterObjectSchema } from './Recent_activityListRelationFilter.schema';
import { Saved_viewListRelationFilterObjectSchema as Saved_viewListRelationFilterObjectSchema } from './Saved_viewListRelationFilter.schema';
import { Search_historyListRelationFilterObjectSchema as Search_historyListRelationFilterObjectSchema } from './Search_historyListRelationFilter.schema';
import { User_preferenceListRelationFilterObjectSchema as User_preferenceListRelationFilterObjectSchema } from './User_preferenceListRelationFilter.schema'

const tenantwhereinputSchema = z.object({
  AND: z.union([z.lazy(() => TenantWhereInputObjectSchema), z.lazy(() => TenantWhereInputObjectSchema).array()]).optional(),
  OR: z.lazy(() => TenantWhereInputObjectSchema).array().optional(),
  NOT: z.union([z.lazy(() => TenantWhereInputObjectSchema), z.lazy(() => TenantWhereInputObjectSchema).array()]).optional(),
  id: z.union([z.lazy(() => UuidFilterObjectSchema), z.string()]).optional(),
  code: z.union([z.lazy(() => StringFilterObjectSchema), z.string()]).optional(),
  name: z.union([z.lazy(() => StringFilterObjectSchema), z.string()]).optional(),
  display_name: z.union([z.lazy(() => StringFilterObjectSchema), z.string()]).optional(),
  realm_key: z.union([z.lazy(() => StringFilterObjectSchema), z.string()]).optional(),
  status: z.union([z.lazy(() => StringFilterObjectSchema), z.string()]).optional(),
  region: z.union([z.lazy(() => StringNullableFilterObjectSchema), z.string()]).optional().nullable(),
  subscription: z.union([z.lazy(() => StringFilterObjectSchema), z.string()]).optional(),
  createdAt: z.union([z.lazy(() => DateTimeFilterObjectSchema), z.coerce.date()]).optional(),
  createdBy: z.union([z.lazy(() => StringFilterObjectSchema), z.string()]).optional(),
  updatedAt: z.union([z.lazy(() => DateTimeNullableFilterObjectSchema), z.coerce.date()]).optional().nullable(),
  updatedBy: z.union([z.lazy(() => StringNullableFilterObjectSchema), z.string()]).optional().nullable(),
  address: z.lazy(() => AddressListRelationFilterObjectSchema).optional(),
  address_link: z.lazy(() => Address_linkListRelationFilterObjectSchema).optional(),
  approval_comment: z.lazy(() => Approval_commentListRelationFilterObjectSchema).optional(),
  approval_definition: z.lazy(() => Approval_definitionListRelationFilterObjectSchema).optional(),
  approval_instance: z.lazy(() => Approval_instanceListRelationFilterObjectSchema).optional(),
  approval_task: z.lazy(() => Approval_taskListRelationFilterObjectSchema).optional(),
  attachment: z.lazy(() => AttachmentListRelationFilterObjectSchema).optional(),
  audit_log: z.lazy(() => Audit_logListRelationFilterObjectSchema).optional(),
  contact_phone: z.lazy(() => Contact_phoneListRelationFilterObjectSchema).optional(),
  contact_point: z.lazy(() => Contact_pointListRelationFilterObjectSchema).optional(),
  document: z.lazy(() => DocumentListRelationFilterObjectSchema).optional(),
  email_otp_instance: z.lazy(() => Email_otp_instanceListRelationFilterObjectSchema).optional(),
  entitlement: z.lazy(() => EntitlementListRelationFilterObjectSchema).optional(),
  entity_tag: z.lazy(() => Entity_tagListRelationFilterObjectSchema).optional(),
  feature_flag: z.lazy(() => Feature_flagListRelationFilterObjectSchema).optional(),
  field_access_log: z.lazy(() => Field_access_logListRelationFilterObjectSchema).optional(),
  groupMembers: z.lazy(() => GroupMemberListRelationFilterObjectSchema).optional(),
  idpIdentities: z.lazy(() => IdpIdentityListRelationFilterObjectSchema).optional(),
  job: z.lazy(() => JobListRelationFilterObjectSchema).optional(),
  job_run: z.lazy(() => Job_runListRelationFilterObjectSchema).optional(),
  lifecycle: z.lazy(() => Core_lifecycleListRelationFilterObjectSchema).optional(),
  lifecycle_version: z.lazy(() => Lifecycle_versionListRelationFilterObjectSchema).optional(),
  mfa_challenge: z.lazy(() => Mfa_challengeListRelationFilterObjectSchema).optional(),
  mfa_config: z.lazy(() => Mfa_configListRelationFilterObjectSchema).optional(),
  organizational_unit: z.lazy(() => Organizational_unitListRelationFilterObjectSchema).optional(),
  outbox: z.lazy(() => OutboxListRelationFilterObjectSchema).optional(),
  password_history: z.lazy(() => Password_historyListRelationFilterObjectSchema).optional(),
  permission_decision_log: z.lazy(() => PermissionDecisionLogListRelationFilterObjectSchema).optional(),
  principals: z.lazy(() => PrincipalListRelationFilterObjectSchema).optional(),
  principal_group: z.lazy(() => Principal_groupListRelationFilterObjectSchema).optional(),
  principal_locale_override: z.lazy(() => Principal_locale_overrideListRelationFilterObjectSchema).optional(),
  principal_ou: z.lazy(() => Principal_ouListRelationFilterObjectSchema).optional(),
  principalProfiles: z.lazy(() => PrincipalProfileListRelationFilterObjectSchema).optional(),
  principal_role: z.lazy(() => Principal_roleListRelationFilterObjectSchema).optional(),
  principal_workspace_access: z.lazy(() => Principal_workspace_accessListRelationFilterObjectSchema).optional(),
  roles: z.lazy(() => RoleListRelationFilterObjectSchema).optional(),
  security_event: z.lazy(() => Security_eventListRelationFilterObjectSchema).optional(),
  sms_otp_instance: z.lazy(() => Sms_otp_instanceListRelationFilterObjectSchema).optional(),
  system_config: z.lazy(() => System_configListRelationFilterObjectSchema).optional(),
  tenant_locale_policy: z.lazy(() => Tenant_locale_policyListRelationFilterObjectSchema).optional(),
  tenant_module_subscription: z.lazy(() => Tenant_module_subscriptionListRelationFilterObjectSchema).optional(),
  tenantProfile: z.union([z.lazy(() => TenantProfileNullableScalarRelationFilterObjectSchema), z.lazy(() => TenantProfileWhereInputObjectSchema)]).optional(),
  totp_instance: z.lazy(() => Totp_instanceListRelationFilterObjectSchema).optional(),
  trusted_device: z.lazy(() => Trusted_deviceListRelationFilterObjectSchema).optional(),
  webauthn_credential: z.lazy(() => Webauthn_credentialListRelationFilterObjectSchema).optional(),
  workflow_instance: z.lazy(() => Workflow_instanceListRelationFilterObjectSchema).optional(),
  workflow_transition: z.lazy(() => Workflow_transitionListRelationFilterObjectSchema).optional(),
  workspace_feature: z.lazy(() => Workspace_featureListRelationFilterObjectSchema).optional(),
  workspace_usage_metric: z.lazy(() => Workspace_usage_metricListRelationFilterObjectSchema).optional(),
  approval_sla_policy: z.lazy(() => Approval_sla_policyListRelationFilterObjectSchema).optional(),
  approval_template: z.lazy(() => Approval_templateListRelationFilterObjectSchema).optional(),
  approval_template_rule: z.lazy(() => Approval_template_ruleListRelationFilterObjectSchema).optional(),
  approval_template_stage: z.lazy(() => Approval_template_stageListRelationFilterObjectSchema).optional(),
  entity: z.lazy(() => EntityListRelationFilterObjectSchema).optional(),
  entity_compiled: z.lazy(() => Entity_compiledListRelationFilterObjectSchema).optional(),
  entity_compiled_overlay: z.lazy(() => Entity_compiled_overlayListRelationFilterObjectSchema).optional(),
  entity_lifecycle: z.lazy(() => Entity_lifecycleListRelationFilterObjectSchema).optional(),
  entity_lifecycle_route_compiled: z.lazy(() => Entity_lifecycle_route_compiledListRelationFilterObjectSchema).optional(),
  entity_policy: z.lazy(() => Entity_policyListRelationFilterObjectSchema).optional(),
  entity_version: z.lazy(() => Entity_versionListRelationFilterObjectSchema).optional(),
  field: z.lazy(() => FieldListRelationFilterObjectSchema).optional(),
  field_security_policy: z.lazy(() => Field_security_policyListRelationFilterObjectSchema).optional(),
  index_def: z.lazy(() => Index_defListRelationFilterObjectSchema).optional(),
  meta_lifecycle: z.lazy(() => Meta_lifecycleListRelationFilterObjectSchema).optional(),
  lifecycle_state: z.lazy(() => Lifecycle_stateListRelationFilterObjectSchema).optional(),
  lifecycle_timer_policy: z.lazy(() => Lifecycle_timer_policyListRelationFilterObjectSchema).optional(),
  lifecycle_transition: z.lazy(() => Lifecycle_transitionListRelationFilterObjectSchema).optional(),
  lifecycle_transition_gate: z.lazy(() => Lifecycle_transition_gateListRelationFilterObjectSchema).optional(),
  overlay: z.lazy(() => OverlayListRelationFilterObjectSchema).optional(),
  overlay_change: z.lazy(() => Overlay_changeListRelationFilterObjectSchema).optional(),
  permission_policy: z.lazy(() => PermissionPolicyListRelationFilterObjectSchema).optional(),
  permission_policy_compiled: z.lazy(() => PermissionPolicyCompiledListRelationFilterObjectSchema).optional(),
  permission_policy_version: z.lazy(() => PermissionPolicyVersionListRelationFilterObjectSchema).optional(),
  permission_rule: z.lazy(() => PermissionRuleListRelationFilterObjectSchema).optional(),
  permission_rule_operation: z.lazy(() => PermissionRuleOperationListRelationFilterObjectSchema).optional(),
  relation: z.lazy(() => RelationListRelationFilterObjectSchema).optional(),
  dashboard_widget: z.lazy(() => Dashboard_widgetListRelationFilterObjectSchema).optional(),
  notification: z.lazy(() => NotificationListRelationFilterObjectSchema).optional(),
  notification_preference: z.lazy(() => Notification_preferenceListRelationFilterObjectSchema).optional(),
  recent_activity: z.lazy(() => Recent_activityListRelationFilterObjectSchema).optional(),
  saved_view: z.lazy(() => Saved_viewListRelationFilterObjectSchema).optional(),
  search_history: z.lazy(() => Search_historyListRelationFilterObjectSchema).optional(),
  user_preference: z.lazy(() => User_preferenceListRelationFilterObjectSchema).optional()
}).strict();
export const TenantWhereInputObjectSchema: z.ZodType<Prisma.TenantWhereInput> = tenantwhereinputSchema as unknown as z.ZodType<Prisma.TenantWhereInput>;
export const TenantWhereInputObjectZodSchema = tenantwhereinputSchema;
