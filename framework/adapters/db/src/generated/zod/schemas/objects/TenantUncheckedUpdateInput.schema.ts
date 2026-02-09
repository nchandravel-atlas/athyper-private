import * as z from 'zod';
import type { Prisma } from '@prisma/client';
import { StringFieldUpdateOperationsInputObjectSchema as StringFieldUpdateOperationsInputObjectSchema } from './StringFieldUpdateOperationsInput.schema';
import { NullableStringFieldUpdateOperationsInputObjectSchema as NullableStringFieldUpdateOperationsInputObjectSchema } from './NullableStringFieldUpdateOperationsInput.schema';
import { DateTimeFieldUpdateOperationsInputObjectSchema as DateTimeFieldUpdateOperationsInputObjectSchema } from './DateTimeFieldUpdateOperationsInput.schema';
import { NullableDateTimeFieldUpdateOperationsInputObjectSchema as NullableDateTimeFieldUpdateOperationsInputObjectSchema } from './NullableDateTimeFieldUpdateOperationsInput.schema';
import { addressUncheckedUpdateManyWithoutTenantNestedInputObjectSchema as addressUncheckedUpdateManyWithoutTenantNestedInputObjectSchema } from './addressUncheckedUpdateManyWithoutTenantNestedInput.schema';
import { address_linkUncheckedUpdateManyWithoutTenantNestedInputObjectSchema as address_linkUncheckedUpdateManyWithoutTenantNestedInputObjectSchema } from './address_linkUncheckedUpdateManyWithoutTenantNestedInput.schema';
import { approval_commentUncheckedUpdateManyWithoutTenantNestedInputObjectSchema as approval_commentUncheckedUpdateManyWithoutTenantNestedInputObjectSchema } from './approval_commentUncheckedUpdateManyWithoutTenantNestedInput.schema';
import { approval_definitionUncheckedUpdateManyWithoutTenantNestedInputObjectSchema as approval_definitionUncheckedUpdateManyWithoutTenantNestedInputObjectSchema } from './approval_definitionUncheckedUpdateManyWithoutTenantNestedInput.schema';
import { approval_instanceUncheckedUpdateManyWithoutTenantNestedInputObjectSchema as approval_instanceUncheckedUpdateManyWithoutTenantNestedInputObjectSchema } from './approval_instanceUncheckedUpdateManyWithoutTenantNestedInput.schema';
import { approval_taskUncheckedUpdateManyWithoutTenantNestedInputObjectSchema as approval_taskUncheckedUpdateManyWithoutTenantNestedInputObjectSchema } from './approval_taskUncheckedUpdateManyWithoutTenantNestedInput.schema';
import { attachmentUncheckedUpdateManyWithoutTenantNestedInputObjectSchema as attachmentUncheckedUpdateManyWithoutTenantNestedInputObjectSchema } from './attachmentUncheckedUpdateManyWithoutTenantNestedInput.schema';
import { audit_logUncheckedUpdateManyWithoutTenantNestedInputObjectSchema as audit_logUncheckedUpdateManyWithoutTenantNestedInputObjectSchema } from './audit_logUncheckedUpdateManyWithoutTenantNestedInput.schema';
import { contact_phoneUncheckedUpdateManyWithoutTenantNestedInputObjectSchema as contact_phoneUncheckedUpdateManyWithoutTenantNestedInputObjectSchema } from './contact_phoneUncheckedUpdateManyWithoutTenantNestedInput.schema';
import { contact_pointUncheckedUpdateManyWithoutTenantNestedInputObjectSchema as contact_pointUncheckedUpdateManyWithoutTenantNestedInputObjectSchema } from './contact_pointUncheckedUpdateManyWithoutTenantNestedInput.schema';
import { documentUncheckedUpdateManyWithoutTenantNestedInputObjectSchema as documentUncheckedUpdateManyWithoutTenantNestedInputObjectSchema } from './documentUncheckedUpdateManyWithoutTenantNestedInput.schema';
import { email_otp_instanceUncheckedUpdateManyWithoutTenantNestedInputObjectSchema as email_otp_instanceUncheckedUpdateManyWithoutTenantNestedInputObjectSchema } from './email_otp_instanceUncheckedUpdateManyWithoutTenantNestedInput.schema';
import { entitlementUncheckedUpdateManyWithoutTenantNestedInputObjectSchema as entitlementUncheckedUpdateManyWithoutTenantNestedInputObjectSchema } from './entitlementUncheckedUpdateManyWithoutTenantNestedInput.schema';
import { entity_tagUncheckedUpdateManyWithoutTenantNestedInputObjectSchema as entity_tagUncheckedUpdateManyWithoutTenantNestedInputObjectSchema } from './entity_tagUncheckedUpdateManyWithoutTenantNestedInput.schema';
import { feature_flagUncheckedUpdateManyWithoutTenantNestedInputObjectSchema as feature_flagUncheckedUpdateManyWithoutTenantNestedInputObjectSchema } from './feature_flagUncheckedUpdateManyWithoutTenantNestedInput.schema';
import { field_access_logUncheckedUpdateManyWithoutTenantNestedInputObjectSchema as field_access_logUncheckedUpdateManyWithoutTenantNestedInputObjectSchema } from './field_access_logUncheckedUpdateManyWithoutTenantNestedInput.schema';
import { GroupMemberUncheckedUpdateManyWithoutTenantNestedInputObjectSchema as GroupMemberUncheckedUpdateManyWithoutTenantNestedInputObjectSchema } from './GroupMemberUncheckedUpdateManyWithoutTenantNestedInput.schema';
import { IdpIdentityUncheckedUpdateManyWithoutTenantNestedInputObjectSchema as IdpIdentityUncheckedUpdateManyWithoutTenantNestedInputObjectSchema } from './IdpIdentityUncheckedUpdateManyWithoutTenantNestedInput.schema';
import { jobUncheckedUpdateManyWithoutTenantNestedInputObjectSchema as jobUncheckedUpdateManyWithoutTenantNestedInputObjectSchema } from './jobUncheckedUpdateManyWithoutTenantNestedInput.schema';
import { job_runUncheckedUpdateManyWithoutTenantNestedInputObjectSchema as job_runUncheckedUpdateManyWithoutTenantNestedInputObjectSchema } from './job_runUncheckedUpdateManyWithoutTenantNestedInput.schema';
import { core_lifecycleUncheckedUpdateManyWithoutTenantNestedInputObjectSchema as core_lifecycleUncheckedUpdateManyWithoutTenantNestedInputObjectSchema } from './core_lifecycleUncheckedUpdateManyWithoutTenantNestedInput.schema';
import { lifecycle_versionUncheckedUpdateManyWithoutTenantNestedInputObjectSchema as lifecycle_versionUncheckedUpdateManyWithoutTenantNestedInputObjectSchema } from './lifecycle_versionUncheckedUpdateManyWithoutTenantNestedInput.schema';
import { mfa_challengeUncheckedUpdateManyWithoutTenantNestedInputObjectSchema as mfa_challengeUncheckedUpdateManyWithoutTenantNestedInputObjectSchema } from './mfa_challengeUncheckedUpdateManyWithoutTenantNestedInput.schema';
import { mfa_configUncheckedUpdateManyWithoutTenantNestedInputObjectSchema as mfa_configUncheckedUpdateManyWithoutTenantNestedInputObjectSchema } from './mfa_configUncheckedUpdateManyWithoutTenantNestedInput.schema';
import { organizational_unitUncheckedUpdateManyWithoutTenantNestedInputObjectSchema as organizational_unitUncheckedUpdateManyWithoutTenantNestedInputObjectSchema } from './organizational_unitUncheckedUpdateManyWithoutTenantNestedInput.schema';
import { outboxUncheckedUpdateManyWithoutTenantNestedInputObjectSchema as outboxUncheckedUpdateManyWithoutTenantNestedInputObjectSchema } from './outboxUncheckedUpdateManyWithoutTenantNestedInput.schema';
import { password_historyUncheckedUpdateManyWithoutTenantNestedInputObjectSchema as password_historyUncheckedUpdateManyWithoutTenantNestedInputObjectSchema } from './password_historyUncheckedUpdateManyWithoutTenantNestedInput.schema';
import { PermissionDecisionLogUncheckedUpdateManyWithoutTenantNestedInputObjectSchema as PermissionDecisionLogUncheckedUpdateManyWithoutTenantNestedInputObjectSchema } from './PermissionDecisionLogUncheckedUpdateManyWithoutTenantNestedInput.schema';
import { PrincipalUncheckedUpdateManyWithoutTenantNestedInputObjectSchema as PrincipalUncheckedUpdateManyWithoutTenantNestedInputObjectSchema } from './PrincipalUncheckedUpdateManyWithoutTenantNestedInput.schema';
import { principal_groupUncheckedUpdateManyWithoutTenantNestedInputObjectSchema as principal_groupUncheckedUpdateManyWithoutTenantNestedInputObjectSchema } from './principal_groupUncheckedUpdateManyWithoutTenantNestedInput.schema';
import { principal_locale_overrideUncheckedUpdateManyWithoutTenantNestedInputObjectSchema as principal_locale_overrideUncheckedUpdateManyWithoutTenantNestedInputObjectSchema } from './principal_locale_overrideUncheckedUpdateManyWithoutTenantNestedInput.schema';
import { principal_ouUncheckedUpdateManyWithoutTenantNestedInputObjectSchema as principal_ouUncheckedUpdateManyWithoutTenantNestedInputObjectSchema } from './principal_ouUncheckedUpdateManyWithoutTenantNestedInput.schema';
import { PrincipalProfileUncheckedUpdateManyWithoutTenantNestedInputObjectSchema as PrincipalProfileUncheckedUpdateManyWithoutTenantNestedInputObjectSchema } from './PrincipalProfileUncheckedUpdateManyWithoutTenantNestedInput.schema';
import { principal_roleUncheckedUpdateManyWithoutTenantNestedInputObjectSchema as principal_roleUncheckedUpdateManyWithoutTenantNestedInputObjectSchema } from './principal_roleUncheckedUpdateManyWithoutTenantNestedInput.schema';
import { principal_workspace_accessUncheckedUpdateManyWithoutTenantNestedInputObjectSchema as principal_workspace_accessUncheckedUpdateManyWithoutTenantNestedInputObjectSchema } from './principal_workspace_accessUncheckedUpdateManyWithoutTenantNestedInput.schema';
import { RoleUncheckedUpdateManyWithoutTenantNestedInputObjectSchema as RoleUncheckedUpdateManyWithoutTenantNestedInputObjectSchema } from './RoleUncheckedUpdateManyWithoutTenantNestedInput.schema';
import { security_eventUncheckedUpdateManyWithoutTenantNestedInputObjectSchema as security_eventUncheckedUpdateManyWithoutTenantNestedInputObjectSchema } from './security_eventUncheckedUpdateManyWithoutTenantNestedInput.schema';
import { sms_otp_instanceUncheckedUpdateManyWithoutTenantNestedInputObjectSchema as sms_otp_instanceUncheckedUpdateManyWithoutTenantNestedInputObjectSchema } from './sms_otp_instanceUncheckedUpdateManyWithoutTenantNestedInput.schema';
import { system_configUncheckedUpdateManyWithoutTenantNestedInputObjectSchema as system_configUncheckedUpdateManyWithoutTenantNestedInputObjectSchema } from './system_configUncheckedUpdateManyWithoutTenantNestedInput.schema';
import { tenant_locale_policyUncheckedUpdateManyWithoutTenantNestedInputObjectSchema as tenant_locale_policyUncheckedUpdateManyWithoutTenantNestedInputObjectSchema } from './tenant_locale_policyUncheckedUpdateManyWithoutTenantNestedInput.schema';
import { tenant_module_subscriptionUncheckedUpdateManyWithoutTenantNestedInputObjectSchema as tenant_module_subscriptionUncheckedUpdateManyWithoutTenantNestedInputObjectSchema } from './tenant_module_subscriptionUncheckedUpdateManyWithoutTenantNestedInput.schema';
import { TenantProfileUncheckedUpdateOneWithoutTenantNestedInputObjectSchema as TenantProfileUncheckedUpdateOneWithoutTenantNestedInputObjectSchema } from './TenantProfileUncheckedUpdateOneWithoutTenantNestedInput.schema';
import { totp_instanceUncheckedUpdateManyWithoutTenantNestedInputObjectSchema as totp_instanceUncheckedUpdateManyWithoutTenantNestedInputObjectSchema } from './totp_instanceUncheckedUpdateManyWithoutTenantNestedInput.schema';
import { trusted_deviceUncheckedUpdateManyWithoutTenantNestedInputObjectSchema as trusted_deviceUncheckedUpdateManyWithoutTenantNestedInputObjectSchema } from './trusted_deviceUncheckedUpdateManyWithoutTenantNestedInput.schema';
import { webauthn_credentialUncheckedUpdateManyWithoutTenantNestedInputObjectSchema as webauthn_credentialUncheckedUpdateManyWithoutTenantNestedInputObjectSchema } from './webauthn_credentialUncheckedUpdateManyWithoutTenantNestedInput.schema';
import { workflow_instanceUncheckedUpdateManyWithoutTenantNestedInputObjectSchema as workflow_instanceUncheckedUpdateManyWithoutTenantNestedInputObjectSchema } from './workflow_instanceUncheckedUpdateManyWithoutTenantNestedInput.schema';
import { workflow_transitionUncheckedUpdateManyWithoutTenantNestedInputObjectSchema as workflow_transitionUncheckedUpdateManyWithoutTenantNestedInputObjectSchema } from './workflow_transitionUncheckedUpdateManyWithoutTenantNestedInput.schema';
import { workspace_featureUncheckedUpdateManyWithoutTenantNestedInputObjectSchema as workspace_featureUncheckedUpdateManyWithoutTenantNestedInputObjectSchema } from './workspace_featureUncheckedUpdateManyWithoutTenantNestedInput.schema';
import { workspace_usage_metricUncheckedUpdateManyWithoutTenantNestedInputObjectSchema as workspace_usage_metricUncheckedUpdateManyWithoutTenantNestedInputObjectSchema } from './workspace_usage_metricUncheckedUpdateManyWithoutTenantNestedInput.schema';
import { approval_sla_policyUncheckedUpdateManyWithoutTenantNestedInputObjectSchema as approval_sla_policyUncheckedUpdateManyWithoutTenantNestedInputObjectSchema } from './approval_sla_policyUncheckedUpdateManyWithoutTenantNestedInput.schema';
import { approval_templateUncheckedUpdateManyWithoutTenantNestedInputObjectSchema as approval_templateUncheckedUpdateManyWithoutTenantNestedInputObjectSchema } from './approval_templateUncheckedUpdateManyWithoutTenantNestedInput.schema';
import { approval_template_ruleUncheckedUpdateManyWithoutTenantNestedInputObjectSchema as approval_template_ruleUncheckedUpdateManyWithoutTenantNestedInputObjectSchema } from './approval_template_ruleUncheckedUpdateManyWithoutTenantNestedInput.schema';
import { approval_template_stageUncheckedUpdateManyWithoutTenantNestedInputObjectSchema as approval_template_stageUncheckedUpdateManyWithoutTenantNestedInputObjectSchema } from './approval_template_stageUncheckedUpdateManyWithoutTenantNestedInput.schema';
import { entityUncheckedUpdateManyWithoutTenantNestedInputObjectSchema as entityUncheckedUpdateManyWithoutTenantNestedInputObjectSchema } from './entityUncheckedUpdateManyWithoutTenantNestedInput.schema';
import { entity_compiledUncheckedUpdateManyWithoutTenantNestedInputObjectSchema as entity_compiledUncheckedUpdateManyWithoutTenantNestedInputObjectSchema } from './entity_compiledUncheckedUpdateManyWithoutTenantNestedInput.schema';
import { entity_compiled_overlayUncheckedUpdateManyWithoutTenantNestedInputObjectSchema as entity_compiled_overlayUncheckedUpdateManyWithoutTenantNestedInputObjectSchema } from './entity_compiled_overlayUncheckedUpdateManyWithoutTenantNestedInput.schema';
import { entity_lifecycleUncheckedUpdateManyWithoutTenantNestedInputObjectSchema as entity_lifecycleUncheckedUpdateManyWithoutTenantNestedInputObjectSchema } from './entity_lifecycleUncheckedUpdateManyWithoutTenantNestedInput.schema';
import { entity_lifecycle_route_compiledUncheckedUpdateManyWithoutTenantNestedInputObjectSchema as entity_lifecycle_route_compiledUncheckedUpdateManyWithoutTenantNestedInputObjectSchema } from './entity_lifecycle_route_compiledUncheckedUpdateManyWithoutTenantNestedInput.schema';
import { entity_policyUncheckedUpdateManyWithoutTenantNestedInputObjectSchema as entity_policyUncheckedUpdateManyWithoutTenantNestedInputObjectSchema } from './entity_policyUncheckedUpdateManyWithoutTenantNestedInput.schema';
import { entity_versionUncheckedUpdateManyWithoutTenantNestedInputObjectSchema as entity_versionUncheckedUpdateManyWithoutTenantNestedInputObjectSchema } from './entity_versionUncheckedUpdateManyWithoutTenantNestedInput.schema';
import { fieldUncheckedUpdateManyWithoutTenantNestedInputObjectSchema as fieldUncheckedUpdateManyWithoutTenantNestedInputObjectSchema } from './fieldUncheckedUpdateManyWithoutTenantNestedInput.schema';
import { field_security_policyUncheckedUpdateManyWithoutTenantNestedInputObjectSchema as field_security_policyUncheckedUpdateManyWithoutTenantNestedInputObjectSchema } from './field_security_policyUncheckedUpdateManyWithoutTenantNestedInput.schema';
import { index_defUncheckedUpdateManyWithoutTenantNestedInputObjectSchema as index_defUncheckedUpdateManyWithoutTenantNestedInputObjectSchema } from './index_defUncheckedUpdateManyWithoutTenantNestedInput.schema';
import { meta_lifecycleUncheckedUpdateManyWithoutTenantNestedInputObjectSchema as meta_lifecycleUncheckedUpdateManyWithoutTenantNestedInputObjectSchema } from './meta_lifecycleUncheckedUpdateManyWithoutTenantNestedInput.schema';
import { lifecycle_stateUncheckedUpdateManyWithoutTenantNestedInputObjectSchema as lifecycle_stateUncheckedUpdateManyWithoutTenantNestedInputObjectSchema } from './lifecycle_stateUncheckedUpdateManyWithoutTenantNestedInput.schema';
import { lifecycle_timer_policyUncheckedUpdateManyWithoutTenantNestedInputObjectSchema as lifecycle_timer_policyUncheckedUpdateManyWithoutTenantNestedInputObjectSchema } from './lifecycle_timer_policyUncheckedUpdateManyWithoutTenantNestedInput.schema';
import { lifecycle_transitionUncheckedUpdateManyWithoutTenantNestedInputObjectSchema as lifecycle_transitionUncheckedUpdateManyWithoutTenantNestedInputObjectSchema } from './lifecycle_transitionUncheckedUpdateManyWithoutTenantNestedInput.schema';
import { lifecycle_transition_gateUncheckedUpdateManyWithoutTenantNestedInputObjectSchema as lifecycle_transition_gateUncheckedUpdateManyWithoutTenantNestedInputObjectSchema } from './lifecycle_transition_gateUncheckedUpdateManyWithoutTenantNestedInput.schema';
import { overlayUncheckedUpdateManyWithoutTenantNestedInputObjectSchema as overlayUncheckedUpdateManyWithoutTenantNestedInputObjectSchema } from './overlayUncheckedUpdateManyWithoutTenantNestedInput.schema';
import { overlay_changeUncheckedUpdateManyWithoutTenantNestedInputObjectSchema as overlay_changeUncheckedUpdateManyWithoutTenantNestedInputObjectSchema } from './overlay_changeUncheckedUpdateManyWithoutTenantNestedInput.schema';
import { PermissionPolicyUncheckedUpdateManyWithoutTenantNestedInputObjectSchema as PermissionPolicyUncheckedUpdateManyWithoutTenantNestedInputObjectSchema } from './PermissionPolicyUncheckedUpdateManyWithoutTenantNestedInput.schema';
import { PermissionPolicyCompiledUncheckedUpdateManyWithoutTenantNestedInputObjectSchema as PermissionPolicyCompiledUncheckedUpdateManyWithoutTenantNestedInputObjectSchema } from './PermissionPolicyCompiledUncheckedUpdateManyWithoutTenantNestedInput.schema';
import { PermissionPolicyVersionUncheckedUpdateManyWithoutTenantNestedInputObjectSchema as PermissionPolicyVersionUncheckedUpdateManyWithoutTenantNestedInputObjectSchema } from './PermissionPolicyVersionUncheckedUpdateManyWithoutTenantNestedInput.schema';
import { PermissionRuleUncheckedUpdateManyWithoutTenantNestedInputObjectSchema as PermissionRuleUncheckedUpdateManyWithoutTenantNestedInputObjectSchema } from './PermissionRuleUncheckedUpdateManyWithoutTenantNestedInput.schema';
import { PermissionRuleOperationUncheckedUpdateManyWithoutTenantNestedInputObjectSchema as PermissionRuleOperationUncheckedUpdateManyWithoutTenantNestedInputObjectSchema } from './PermissionRuleOperationUncheckedUpdateManyWithoutTenantNestedInput.schema';
import { relationUncheckedUpdateManyWithoutTenantNestedInputObjectSchema as relationUncheckedUpdateManyWithoutTenantNestedInputObjectSchema } from './relationUncheckedUpdateManyWithoutTenantNestedInput.schema';
import { dashboard_widgetUncheckedUpdateManyWithoutTenantNestedInputObjectSchema as dashboard_widgetUncheckedUpdateManyWithoutTenantNestedInputObjectSchema } from './dashboard_widgetUncheckedUpdateManyWithoutTenantNestedInput.schema';
import { notificationUncheckedUpdateManyWithoutTenantNestedInputObjectSchema as notificationUncheckedUpdateManyWithoutTenantNestedInputObjectSchema } from './notificationUncheckedUpdateManyWithoutTenantNestedInput.schema';
import { notification_preferenceUncheckedUpdateManyWithoutTenantNestedInputObjectSchema as notification_preferenceUncheckedUpdateManyWithoutTenantNestedInputObjectSchema } from './notification_preferenceUncheckedUpdateManyWithoutTenantNestedInput.schema';
import { recent_activityUncheckedUpdateManyWithoutTenantNestedInputObjectSchema as recent_activityUncheckedUpdateManyWithoutTenantNestedInputObjectSchema } from './recent_activityUncheckedUpdateManyWithoutTenantNestedInput.schema';
import { saved_viewUncheckedUpdateManyWithoutTenantNestedInputObjectSchema as saved_viewUncheckedUpdateManyWithoutTenantNestedInputObjectSchema } from './saved_viewUncheckedUpdateManyWithoutTenantNestedInput.schema';
import { search_historyUncheckedUpdateManyWithoutTenantNestedInputObjectSchema as search_historyUncheckedUpdateManyWithoutTenantNestedInputObjectSchema } from './search_historyUncheckedUpdateManyWithoutTenantNestedInput.schema';
import { user_preferenceUncheckedUpdateManyWithoutTenantNestedInputObjectSchema as user_preferenceUncheckedUpdateManyWithoutTenantNestedInputObjectSchema } from './user_preferenceUncheckedUpdateManyWithoutTenantNestedInput.schema'

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
  address: z.lazy(() => addressUncheckedUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  address_link: z.lazy(() => address_linkUncheckedUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  approval_comment: z.lazy(() => approval_commentUncheckedUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  approval_definition: z.lazy(() => approval_definitionUncheckedUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  approval_instance: z.lazy(() => approval_instanceUncheckedUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  approval_task: z.lazy(() => approval_taskUncheckedUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  attachment: z.lazy(() => attachmentUncheckedUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  audit_log: z.lazy(() => audit_logUncheckedUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  contact_phone: z.lazy(() => contact_phoneUncheckedUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  contact_point: z.lazy(() => contact_pointUncheckedUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  document: z.lazy(() => documentUncheckedUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  email_otp_instance: z.lazy(() => email_otp_instanceUncheckedUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  entitlement: z.lazy(() => entitlementUncheckedUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  entity_tag: z.lazy(() => entity_tagUncheckedUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  feature_flag: z.lazy(() => feature_flagUncheckedUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  field_access_log: z.lazy(() => field_access_logUncheckedUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  groupMembers: z.lazy(() => GroupMemberUncheckedUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  idpIdentities: z.lazy(() => IdpIdentityUncheckedUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  job: z.lazy(() => jobUncheckedUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  job_run: z.lazy(() => job_runUncheckedUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  lifecycle: z.lazy(() => core_lifecycleUncheckedUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  lifecycle_version: z.lazy(() => lifecycle_versionUncheckedUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  mfa_challenge: z.lazy(() => mfa_challengeUncheckedUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  mfa_config: z.lazy(() => mfa_configUncheckedUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  organizational_unit: z.lazy(() => organizational_unitUncheckedUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  outbox: z.lazy(() => outboxUncheckedUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  password_history: z.lazy(() => password_historyUncheckedUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  permission_decision_log: z.lazy(() => PermissionDecisionLogUncheckedUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  principals: z.lazy(() => PrincipalUncheckedUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  principal_group: z.lazy(() => principal_groupUncheckedUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  principal_locale_override: z.lazy(() => principal_locale_overrideUncheckedUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  principal_ou: z.lazy(() => principal_ouUncheckedUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  principalProfiles: z.lazy(() => PrincipalProfileUncheckedUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  principal_role: z.lazy(() => principal_roleUncheckedUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  principal_workspace_access: z.lazy(() => principal_workspace_accessUncheckedUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  roles: z.lazy(() => RoleUncheckedUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  security_event: z.lazy(() => security_eventUncheckedUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  sms_otp_instance: z.lazy(() => sms_otp_instanceUncheckedUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  system_config: z.lazy(() => system_configUncheckedUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  tenant_locale_policy: z.lazy(() => tenant_locale_policyUncheckedUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  tenant_module_subscription: z.lazy(() => tenant_module_subscriptionUncheckedUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  tenantProfile: z.lazy(() => TenantProfileUncheckedUpdateOneWithoutTenantNestedInputObjectSchema).optional(),
  totp_instance: z.lazy(() => totp_instanceUncheckedUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  trusted_device: z.lazy(() => trusted_deviceUncheckedUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  webauthn_credential: z.lazy(() => webauthn_credentialUncheckedUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  workflow_instance: z.lazy(() => workflow_instanceUncheckedUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  workflow_transition: z.lazy(() => workflow_transitionUncheckedUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  workspace_feature: z.lazy(() => workspace_featureUncheckedUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  workspace_usage_metric: z.lazy(() => workspace_usage_metricUncheckedUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  approval_sla_policy: z.lazy(() => approval_sla_policyUncheckedUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  approval_template: z.lazy(() => approval_templateUncheckedUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  approval_template_rule: z.lazy(() => approval_template_ruleUncheckedUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  approval_template_stage: z.lazy(() => approval_template_stageUncheckedUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  entity: z.lazy(() => entityUncheckedUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  entity_compiled: z.lazy(() => entity_compiledUncheckedUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  entity_compiled_overlay: z.lazy(() => entity_compiled_overlayUncheckedUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  entity_lifecycle: z.lazy(() => entity_lifecycleUncheckedUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  entity_lifecycle_route_compiled: z.lazy(() => entity_lifecycle_route_compiledUncheckedUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  entity_policy: z.lazy(() => entity_policyUncheckedUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  entity_version: z.lazy(() => entity_versionUncheckedUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  field: z.lazy(() => fieldUncheckedUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  field_security_policy: z.lazy(() => field_security_policyUncheckedUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  index_def: z.lazy(() => index_defUncheckedUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  meta_lifecycle: z.lazy(() => meta_lifecycleUncheckedUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  lifecycle_state: z.lazy(() => lifecycle_stateUncheckedUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  lifecycle_timer_policy: z.lazy(() => lifecycle_timer_policyUncheckedUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  lifecycle_transition: z.lazy(() => lifecycle_transitionUncheckedUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  lifecycle_transition_gate: z.lazy(() => lifecycle_transition_gateUncheckedUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  overlay: z.lazy(() => overlayUncheckedUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  overlay_change: z.lazy(() => overlay_changeUncheckedUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  permission_policy: z.lazy(() => PermissionPolicyUncheckedUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  permission_policy_compiled: z.lazy(() => PermissionPolicyCompiledUncheckedUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  permission_policy_version: z.lazy(() => PermissionPolicyVersionUncheckedUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  permission_rule: z.lazy(() => PermissionRuleUncheckedUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  permission_rule_operation: z.lazy(() => PermissionRuleOperationUncheckedUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  relation: z.lazy(() => relationUncheckedUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  dashboard_widget: z.lazy(() => dashboard_widgetUncheckedUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  notification: z.lazy(() => notificationUncheckedUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  notification_preference: z.lazy(() => notification_preferenceUncheckedUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  recent_activity: z.lazy(() => recent_activityUncheckedUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  saved_view: z.lazy(() => saved_viewUncheckedUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  search_history: z.lazy(() => search_historyUncheckedUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  user_preference: z.lazy(() => user_preferenceUncheckedUpdateManyWithoutTenantNestedInputObjectSchema).optional()
}).strict();
export const TenantUncheckedUpdateInputObjectSchema: z.ZodType<Prisma.TenantUncheckedUpdateInput> = makeSchema() as unknown as z.ZodType<Prisma.TenantUncheckedUpdateInput>;
export const TenantUncheckedUpdateInputObjectZodSchema = makeSchema();
