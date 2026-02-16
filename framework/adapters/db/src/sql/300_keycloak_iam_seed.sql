/* ============================================================================
   Athyper — Keycloak IAM Seed Data
   
   This file contains essential Keycloak configuration for IAM:
   - Realm configurations (master, athyper)
   - Client configurations (neon-web, etc.)
   - Organizations (demo_in, demo_my, demo_sa, demo_qa, demo_fr)
   - Roles (realm and client roles)
   - Users and Groups
   - Authentication flows
   
   PostgreSQL 16+
   Target Database: athyperauth_dev1 (Keycloak database)
   
   Generated from: dump-athyperauth_dev1-202602161343.sql
   Generated on: 2026-02-16
   ============================================================================ */

BEGIN;

SET client_encoding = 'UTF8';
SET standard_conforming_strings = 'on';


-- ============================================================================
-- Data for table: realm
-- ============================================================================

COPY public.realm (id, access_code_lifespan, user_action_lifespan, access_token_lifespan, account_theme, admin_theme, email_theme, enabled, events_enabled, events_expiration, login_theme, name, not_before, password_policy, registration_allowed, remember_me, reset_password_allowed, social, ssl_required, sso_idle_timeout, sso_max_lifespan, update_profile_on_soc_login, verify_email, master_admin_client, login_lifespan, internationalization_enabled, default_locale, reg_email_as_username, admin_events_enabled, admin_events_details_enabled, edit_username_allowed, otp_policy_counter, otp_policy_window, otp_policy_period, otp_policy_digits, otp_policy_alg, otp_policy_type, browser_flow, registration_flow, direct_grant_flow, reset_credentials_flow, client_auth_flow, offline_session_idle_timeout, revoke_refresh_token, access_token_life_implicit, login_with_email_allowed, duplicate_emails_allowed, docker_auth_flow, refresh_token_max_reuse, allow_user_managed_access, sso_max_lifespan_remember_me, sso_idle_timeout_remember_me, default_role) FROM stdin;
6325ed20-8593-447d-95ca-17e4271cc794	60	300	60	\N	\N	\N	t	f	0	\N	master	0	\N	f	f	f	f	EXTERNAL	1800	36000	f	f	5b648c89-4b90-4c9a-a8e1-c0b0cb1bab07	1800	f	\N	f	f	f	f	0	1	30	6	HmacSHA1	totp	9fa6c218-1d98-48b9-8a25-d040ca9208d1	efc5d930-4e1f-465a-a9a8-8e76aa9a2e89	0d74e352-10f0-4250-adc0-277e5b73c356	d3cabed6-baf9-499d-9b6f-1007c905d9a2	d3d28c5e-602f-4e93-8a25-caa7e3930e6b	2592000	f	900	t	f	13564e44-48a1-40e1-80dd-8371ad82c240	0	f	0	0	aec4465f-bce6-4a27-b35d-b5eed1fa9642
5139da68-ccba-407f-a23e-8551400f5c1c	60	300	300	\N	\N	\N	t	f	0	\N	athyper	0	\N	f	f	f	f	EXTERNAL	1800	36000	f	f	4f9f9d93-ba74-424f-a11d-77d3b77c1ac2	1800	f	\N	f	f	f	f	0	1	30	6	HmacSHA1	totp	8b0508b8-e0f7-4513-aecf-d38a1389b933	eb2ec5ef-ec6f-420f-ae02-a18972811528	df48b5be-7e69-43f1-a384-5727239da1d5	1e5aa93b-93fd-43bb-ae5e-5bd85f5cb030	4b249ead-204a-46e9-89b7-4de364d0a0fe	2592000	f	900	t	f	c2840e47-6220-41bb-8af8-668eeba86537	0	f	0	0	1cec4d75-6e0d-4ba4-a4e0-d6c0cf2a9ac6
\.


-- ============================================================================
-- Data for table: realm_attribute
-- ============================================================================

COPY public.realm_attribute (name, realm_id, value) FROM stdin;
_browser_header.contentSecurityPolicyReportOnly	6325ed20-8593-447d-95ca-17e4271cc794	
_browser_header.xContentTypeOptions	6325ed20-8593-447d-95ca-17e4271cc794	nosniff
_browser_header.referrerPolicy	6325ed20-8593-447d-95ca-17e4271cc794	no-referrer
_browser_header.xRobotsTag	6325ed20-8593-447d-95ca-17e4271cc794	none
_browser_header.xFrameOptions	6325ed20-8593-447d-95ca-17e4271cc794	SAMEORIGIN
_browser_header.contentSecurityPolicy	6325ed20-8593-447d-95ca-17e4271cc794	frame-src 'self'; frame-ancestors 'self'; object-src 'none';
_browser_header.strictTransportSecurity	6325ed20-8593-447d-95ca-17e4271cc794	max-age=31536000; includeSubDomains
bruteForceProtected	6325ed20-8593-447d-95ca-17e4271cc794	false
permanentLockout	6325ed20-8593-447d-95ca-17e4271cc794	false
maxTemporaryLockouts	6325ed20-8593-447d-95ca-17e4271cc794	0
bruteForceStrategy	6325ed20-8593-447d-95ca-17e4271cc794	MULTIPLE
maxFailureWaitSeconds	6325ed20-8593-447d-95ca-17e4271cc794	900
minimumQuickLoginWaitSeconds	6325ed20-8593-447d-95ca-17e4271cc794	60
waitIncrementSeconds	6325ed20-8593-447d-95ca-17e4271cc794	60
quickLoginCheckMilliSeconds	6325ed20-8593-447d-95ca-17e4271cc794	1000
maxDeltaTimeSeconds	6325ed20-8593-447d-95ca-17e4271cc794	43200
failureFactor	6325ed20-8593-447d-95ca-17e4271cc794	30
realmReusableOtpCode	6325ed20-8593-447d-95ca-17e4271cc794	false
firstBrokerLoginFlowId	6325ed20-8593-447d-95ca-17e4271cc794	a1db7761-bb8e-4e75-8417-ad30c7ca95d4
displayName	6325ed20-8593-447d-95ca-17e4271cc794	Keycloak
displayNameHtml	6325ed20-8593-447d-95ca-17e4271cc794	<div class="kc-logo-text"><span>Keycloak</span></div>
defaultSignatureAlgorithm	6325ed20-8593-447d-95ca-17e4271cc794	RS256
offlineSessionMaxLifespanEnabled	6325ed20-8593-447d-95ca-17e4271cc794	false
offlineSessionMaxLifespan	6325ed20-8593-447d-95ca-17e4271cc794	5184000
_browser_header.contentSecurityPolicyReportOnly	5139da68-ccba-407f-a23e-8551400f5c1c	
_browser_header.xContentTypeOptions	5139da68-ccba-407f-a23e-8551400f5c1c	nosniff
_browser_header.referrerPolicy	5139da68-ccba-407f-a23e-8551400f5c1c	no-referrer
_browser_header.xRobotsTag	5139da68-ccba-407f-a23e-8551400f5c1c	none
_browser_header.xFrameOptions	5139da68-ccba-407f-a23e-8551400f5c1c	SAMEORIGIN
_browser_header.contentSecurityPolicy	5139da68-ccba-407f-a23e-8551400f5c1c	frame-src 'self'; frame-ancestors 'self'; object-src 'none';
_browser_header.strictTransportSecurity	5139da68-ccba-407f-a23e-8551400f5c1c	max-age=31536000; includeSubDomains
bruteForceProtected	5139da68-ccba-407f-a23e-8551400f5c1c	false
permanentLockout	5139da68-ccba-407f-a23e-8551400f5c1c	false
maxTemporaryLockouts	5139da68-ccba-407f-a23e-8551400f5c1c	0
bruteForceStrategy	5139da68-ccba-407f-a23e-8551400f5c1c	MULTIPLE
maxFailureWaitSeconds	5139da68-ccba-407f-a23e-8551400f5c1c	900
minimumQuickLoginWaitSeconds	5139da68-ccba-407f-a23e-8551400f5c1c	60
waitIncrementSeconds	5139da68-ccba-407f-a23e-8551400f5c1c	60
quickLoginCheckMilliSeconds	5139da68-ccba-407f-a23e-8551400f5c1c	1000
maxDeltaTimeSeconds	5139da68-ccba-407f-a23e-8551400f5c1c	43200
failureFactor	5139da68-ccba-407f-a23e-8551400f5c1c	30
realmReusableOtpCode	5139da68-ccba-407f-a23e-8551400f5c1c	false
defaultSignatureAlgorithm	5139da68-ccba-407f-a23e-8551400f5c1c	RS256
offlineSessionMaxLifespanEnabled	5139da68-ccba-407f-a23e-8551400f5c1c	false
offlineSessionMaxLifespan	5139da68-ccba-407f-a23e-8551400f5c1c	5184000
actionTokenGeneratedByAdminLifespan	5139da68-ccba-407f-a23e-8551400f5c1c	43200
actionTokenGeneratedByUserLifespan	5139da68-ccba-407f-a23e-8551400f5c1c	300
oauth2DeviceCodeLifespan	5139da68-ccba-407f-a23e-8551400f5c1c	600
oauth2DevicePollingInterval	5139da68-ccba-407f-a23e-8551400f5c1c	5
webAuthnPolicyRpEntityName	5139da68-ccba-407f-a23e-8551400f5c1c	keycloak
webAuthnPolicySignatureAlgorithms	5139da68-ccba-407f-a23e-8551400f5c1c	ES256,RS256
webAuthnPolicyRpId	5139da68-ccba-407f-a23e-8551400f5c1c	
webAuthnPolicyAttestationConveyancePreference	5139da68-ccba-407f-a23e-8551400f5c1c	not specified
webAuthnPolicyAuthenticatorAttachment	5139da68-ccba-407f-a23e-8551400f5c1c	not specified
webAuthnPolicyRequireResidentKey	5139da68-ccba-407f-a23e-8551400f5c1c	not specified
webAuthnPolicyUserVerificationRequirement	5139da68-ccba-407f-a23e-8551400f5c1c	not specified
webAuthnPolicyCreateTimeout	5139da68-ccba-407f-a23e-8551400f5c1c	0
webAuthnPolicyAvoidSameAuthenticatorRegister	5139da68-ccba-407f-a23e-8551400f5c1c	false
webAuthnPolicyRpEntityNamePasswordless	5139da68-ccba-407f-a23e-8551400f5c1c	keycloak
webAuthnPolicySignatureAlgorithmsPasswordless	5139da68-ccba-407f-a23e-8551400f5c1c	ES256,RS256
webAuthnPolicyRpIdPasswordless	5139da68-ccba-407f-a23e-8551400f5c1c	
webAuthnPolicyAttestationConveyancePreferencePasswordless	5139da68-ccba-407f-a23e-8551400f5c1c	not specified
webAuthnPolicyAuthenticatorAttachmentPasswordless	5139da68-ccba-407f-a23e-8551400f5c1c	not specified
webAuthnPolicyRequireResidentKeyPasswordless	5139da68-ccba-407f-a23e-8551400f5c1c	Yes
webAuthnPolicyUserVerificationRequirementPasswordless	5139da68-ccba-407f-a23e-8551400f5c1c	required
webAuthnPolicyCreateTimeoutPasswordless	5139da68-ccba-407f-a23e-8551400f5c1c	0
webAuthnPolicyAvoidSameAuthenticatorRegisterPasswordless	5139da68-ccba-407f-a23e-8551400f5c1c	false
cibaBackchannelTokenDeliveryMode	5139da68-ccba-407f-a23e-8551400f5c1c	poll
cibaExpiresIn	5139da68-ccba-407f-a23e-8551400f5c1c	120
cibaInterval	5139da68-ccba-407f-a23e-8551400f5c1c	5
cibaAuthRequestedUserHint	5139da68-ccba-407f-a23e-8551400f5c1c	login_hint
parRequestUriLifespan	5139da68-ccba-407f-a23e-8551400f5c1c	60
firstBrokerLoginFlowId	5139da68-ccba-407f-a23e-8551400f5c1c	39e6a851-4bcb-4c3b-9ccf-0ba4f45a3ce1
frontendUrl	5139da68-ccba-407f-a23e-8551400f5c1c	
saml.signature.algorithm	5139da68-ccba-407f-a23e-8551400f5c1c	
acr.loa.map	5139da68-ccba-407f-a23e-8551400f5c1c	{}
displayNameHtml	5139da68-ccba-407f-a23e-8551400f5c1c	athyper Business Operating Platform
adminPermissionsEnabled	5139da68-ccba-407f-a23e-8551400f5c1c	false
verifiableCredentialsEnabled	5139da68-ccba-407f-a23e-8551400f5c1c	false
client-policies.profiles	5139da68-ccba-407f-a23e-8551400f5c1c	{"profiles":[]}
client-policies.policies	5139da68-ccba-407f-a23e-8551400f5c1c	{"policies":[]}
organizationsEnabled	5139da68-ccba-407f-a23e-8551400f5c1c	true
clientSessionIdleTimeout	5139da68-ccba-407f-a23e-8551400f5c1c	0
clientSessionMaxLifespan	5139da68-ccba-407f-a23e-8551400f5c1c	0
clientOfflineSessionIdleTimeout	5139da68-ccba-407f-a23e-8551400f5c1c	0
clientOfflineSessionMaxLifespan	5139da68-ccba-407f-a23e-8551400f5c1c	0
displayName	5139da68-ccba-407f-a23e-8551400f5c1c	athyper
\.


-- ============================================================================
-- Data for table: realm_required_credential
-- ============================================================================

COPY public.realm_required_credential (type, form_label, input, secret, realm_id) FROM stdin;
password	password	t	t	6325ed20-8593-447d-95ca-17e4271cc794
password	password	t	t	5139da68-ccba-407f-a23e-8551400f5c1c
\.


-- ============================================================================
-- Data for table: realm_enabled_event_types
-- ============================================================================

COPY public.realm_enabled_event_types (realm_id, value) FROM stdin;
\.


-- ============================================================================
-- Data for table: realm_events_listeners
-- ============================================================================

COPY public.realm_events_listeners (realm_id, value) FROM stdin;
6325ed20-8593-447d-95ca-17e4271cc794	jboss-logging
5139da68-ccba-407f-a23e-8551400f5c1c	jboss-logging
\.


-- ============================================================================
-- Data for table: realm_supported_locales
-- ============================================================================

COPY public.realm_supported_locales (realm_id, value) FROM stdin;
\.


-- ============================================================================
-- Data for table: realm_smtp_config
-- ============================================================================

COPY public.realm_smtp_config (realm_id, value, name) FROM stdin;
\.


-- ============================================================================
-- Data for table: realm_localizations
-- ============================================================================

COPY public.realm_localizations (realm_id, locale, texts) FROM stdin;
\.


-- ============================================================================
-- Data for table: authentication_flow
-- ============================================================================

COPY public.authentication_flow (id, alias, description, realm_id, provider_id, top_level, built_in) FROM stdin;
9fa6c218-1d98-48b9-8a25-d040ca9208d1	browser	Browser based authentication	6325ed20-8593-447d-95ca-17e4271cc794	basic-flow	t	t
bb1b2e32-19b0-477f-8976-b405a9d28f4b	forms	Username, password, otp and other auth forms.	6325ed20-8593-447d-95ca-17e4271cc794	basic-flow	f	t
626ddea0-f667-49b1-aabe-7f7c8ccc6e47	Browser - Conditional 2FA	Flow to determine if any 2FA is required for the authentication	6325ed20-8593-447d-95ca-17e4271cc794	basic-flow	f	t
0d74e352-10f0-4250-adc0-277e5b73c356	direct grant	OpenID Connect Resource Owner Grant	6325ed20-8593-447d-95ca-17e4271cc794	basic-flow	t	t
ee69c91b-6305-42fa-af34-f8a4e16b95b7	Direct Grant - Conditional OTP	Flow to determine if the OTP is required for the authentication	6325ed20-8593-447d-95ca-17e4271cc794	basic-flow	f	t
efc5d930-4e1f-465a-a9a8-8e76aa9a2e89	registration	Registration flow	6325ed20-8593-447d-95ca-17e4271cc794	basic-flow	t	t
30c67fd4-1377-4023-9660-40f99b565a4a	registration form	Registration form	6325ed20-8593-447d-95ca-17e4271cc794	form-flow	f	t
d3cabed6-baf9-499d-9b6f-1007c905d9a2	reset credentials	Reset credentials for a user if they forgot their password or something	6325ed20-8593-447d-95ca-17e4271cc794	basic-flow	t	t
6e8c7388-3534-4225-b320-ad26e8c12723	Reset - Conditional OTP	Flow to determine if the OTP should be reset or not. Set to REQUIRED to force.	6325ed20-8593-447d-95ca-17e4271cc794	basic-flow	f	t
d3d28c5e-602f-4e93-8a25-caa7e3930e6b	clients	Base authentication for clients	6325ed20-8593-447d-95ca-17e4271cc794	client-flow	t	t
a1db7761-bb8e-4e75-8417-ad30c7ca95d4	first broker login	Actions taken after first broker login with identity provider account, which is not yet linked to any Keycloak account	6325ed20-8593-447d-95ca-17e4271cc794	basic-flow	t	t
054a1ec4-31d2-45dd-9561-4492825ac589	User creation or linking	Flow for the existing/non-existing user alternatives	6325ed20-8593-447d-95ca-17e4271cc794	basic-flow	f	t
b0baba78-89d0-458f-afd6-36cd570285d3	Handle Existing Account	Handle what to do if there is existing account with same email/username like authenticated identity provider	6325ed20-8593-447d-95ca-17e4271cc794	basic-flow	f	t
1c682943-2b1e-49c7-b1fe-b950a8d10bbd	Account verification options	Method with which to verify the existing account	6325ed20-8593-447d-95ca-17e4271cc794	basic-flow	f	t
8bc8722c-a877-4224-ac9f-5f6ffdd1ce79	Verify Existing Account by Re-authentication	Reauthentication of existing account	6325ed20-8593-447d-95ca-17e4271cc794	basic-flow	f	t
f50da32b-ec45-4486-9ba6-66ab39375d8e	First broker login - Conditional 2FA	Flow to determine if any 2FA is required for the authentication	6325ed20-8593-447d-95ca-17e4271cc794	basic-flow	f	t
e82105ec-65ba-4099-a187-4c2faff932c8	saml ecp	SAML ECP Profile Authentication Flow	6325ed20-8593-447d-95ca-17e4271cc794	basic-flow	t	t
13564e44-48a1-40e1-80dd-8371ad82c240	docker auth	Used by Docker clients to authenticate against the IDP	6325ed20-8593-447d-95ca-17e4271cc794	basic-flow	t	t
8b0508b8-e0f7-4513-aecf-d38a1389b933	browser	Browser based authentication	5139da68-ccba-407f-a23e-8551400f5c1c	basic-flow	t	t
f1c38bc9-6f95-49ae-972d-5b997cb5c156	forms	Username, password, otp and other auth forms.	5139da68-ccba-407f-a23e-8551400f5c1c	basic-flow	f	t
980c99e1-7251-48f4-b00b-aa06131866e2	Browser - Conditional 2FA	Flow to determine if any 2FA is required for the authentication	5139da68-ccba-407f-a23e-8551400f5c1c	basic-flow	f	t
061d6c97-5195-4415-9ad4-f43af3ebf1ae	Organization	\N	5139da68-ccba-407f-a23e-8551400f5c1c	basic-flow	f	t
fb5f31c4-9672-470f-98ce-3acf504eeb8a	Browser - Conditional Organization	Flow to determine if the organization identity-first login is to be used	5139da68-ccba-407f-a23e-8551400f5c1c	basic-flow	f	t
df48b5be-7e69-43f1-a384-5727239da1d5	direct grant	OpenID Connect Resource Owner Grant	5139da68-ccba-407f-a23e-8551400f5c1c	basic-flow	t	t
181d5768-7aa1-444f-8738-10d37bf6c80a	Direct Grant - Conditional OTP	Flow to determine if the OTP is required for the authentication	5139da68-ccba-407f-a23e-8551400f5c1c	basic-flow	f	t
eb2ec5ef-ec6f-420f-ae02-a18972811528	registration	Registration flow	5139da68-ccba-407f-a23e-8551400f5c1c	basic-flow	t	t
e19585c3-f891-44e7-b2b3-d51dbca947e0	registration form	Registration form	5139da68-ccba-407f-a23e-8551400f5c1c	form-flow	f	t
1e5aa93b-93fd-43bb-ae5e-5bd85f5cb030	reset credentials	Reset credentials for a user if they forgot their password or something	5139da68-ccba-407f-a23e-8551400f5c1c	basic-flow	t	t
4230584b-8b35-439a-b651-31acea375a22	Reset - Conditional OTP	Flow to determine if the OTP should be reset or not. Set to REQUIRED to force.	5139da68-ccba-407f-a23e-8551400f5c1c	basic-flow	f	t
4b249ead-204a-46e9-89b7-4de364d0a0fe	clients	Base authentication for clients	5139da68-ccba-407f-a23e-8551400f5c1c	client-flow	t	t
39e6a851-4bcb-4c3b-9ccf-0ba4f45a3ce1	first broker login	Actions taken after first broker login with identity provider account, which is not yet linked to any Keycloak account	5139da68-ccba-407f-a23e-8551400f5c1c	basic-flow	t	t
29c7110d-f42e-454e-863a-c8d2aa28cfcf	User creation or linking	Flow for the existing/non-existing user alternatives	5139da68-ccba-407f-a23e-8551400f5c1c	basic-flow	f	t
f451b75d-f010-453a-a0b4-6c4d61fea315	Handle Existing Account	Handle what to do if there is existing account with same email/username like authenticated identity provider	5139da68-ccba-407f-a23e-8551400f5c1c	basic-flow	f	t
1031db13-0f6c-42a9-b8ce-981978326c86	Account verification options	Method with which to verify the existing account	5139da68-ccba-407f-a23e-8551400f5c1c	basic-flow	f	t
4efa59d8-2ea5-4193-b7d9-268cd8967fbe	Verify Existing Account by Re-authentication	Reauthentication of existing account	5139da68-ccba-407f-a23e-8551400f5c1c	basic-flow	f	t
f87eec99-931f-4adc-bd85-c4c4b8d8de09	First broker login - Conditional 2FA	Flow to determine if any 2FA is required for the authentication	5139da68-ccba-407f-a23e-8551400f5c1c	basic-flow	f	t
a79396e9-0f7b-4cbb-8a2c-226ff664ab8b	First Broker Login - Conditional Organization	Flow to determine if the authenticator that adds organization members is to be used	5139da68-ccba-407f-a23e-8551400f5c1c	basic-flow	f	t
947dda34-33ab-488a-9aeb-e4677e616742	saml ecp	SAML ECP Profile Authentication Flow	5139da68-ccba-407f-a23e-8551400f5c1c	basic-flow	t	t
c2840e47-6220-41bb-8af8-668eeba86537	docker auth	Used by Docker clients to authenticate against the IDP	5139da68-ccba-407f-a23e-8551400f5c1c	basic-flow	t	t
\.


-- ============================================================================
-- Data for table: authentication_execution
-- ============================================================================

COPY public.authentication_execution (id, alias, authenticator, realm_id, flow_id, requirement, priority, authenticator_flow, auth_flow_id, auth_config) FROM stdin;
8e591551-cdf2-4f46-9632-0096d5dc884d	\N	auth-cookie	6325ed20-8593-447d-95ca-17e4271cc794	9fa6c218-1d98-48b9-8a25-d040ca9208d1	2	10	f	\N	\N
852c0ab0-266b-4ba9-8bd1-4b2aa11ee4af	\N	auth-spnego	6325ed20-8593-447d-95ca-17e4271cc794	9fa6c218-1d98-48b9-8a25-d040ca9208d1	3	20	f	\N	\N
f7ace3d3-7241-4cbf-bd62-a32c677a8cee	\N	identity-provider-redirector	6325ed20-8593-447d-95ca-17e4271cc794	9fa6c218-1d98-48b9-8a25-d040ca9208d1	2	25	f	\N	\N
ae240e1f-e512-41d6-b101-235492af45cf	\N	\N	6325ed20-8593-447d-95ca-17e4271cc794	9fa6c218-1d98-48b9-8a25-d040ca9208d1	2	30	t	bb1b2e32-19b0-477f-8976-b405a9d28f4b	\N
ec326be7-0779-4164-8558-f5090f9df8c9	\N	auth-username-password-form	6325ed20-8593-447d-95ca-17e4271cc794	bb1b2e32-19b0-477f-8976-b405a9d28f4b	0	10	f	\N	\N
32b3ee80-2f5c-4293-bd86-9bd9c6507a63	\N	\N	6325ed20-8593-447d-95ca-17e4271cc794	bb1b2e32-19b0-477f-8976-b405a9d28f4b	1	20	t	626ddea0-f667-49b1-aabe-7f7c8ccc6e47	\N
9eecdac6-eeba-47b1-a823-4ecef5e87789	\N	conditional-user-configured	6325ed20-8593-447d-95ca-17e4271cc794	626ddea0-f667-49b1-aabe-7f7c8ccc6e47	0	10	f	\N	\N
c0147dc7-e41b-4be5-a02d-941f98cde966	\N	conditional-credential	6325ed20-8593-447d-95ca-17e4271cc794	626ddea0-f667-49b1-aabe-7f7c8ccc6e47	0	20	f	\N	1f567c73-d717-4ab1-907a-5f4382aa4cd7
a3d68704-523f-4581-8cc2-b50d171f2167	\N	auth-otp-form	6325ed20-8593-447d-95ca-17e4271cc794	626ddea0-f667-49b1-aabe-7f7c8ccc6e47	2	30	f	\N	\N
4a35cdd3-e3dd-4b7d-be30-97934050e27a	\N	webauthn-authenticator	6325ed20-8593-447d-95ca-17e4271cc794	626ddea0-f667-49b1-aabe-7f7c8ccc6e47	3	40	f	\N	\N
f2cc6a69-e687-405b-a415-9c752bd062b7	\N	auth-recovery-authn-code-form	6325ed20-8593-447d-95ca-17e4271cc794	626ddea0-f667-49b1-aabe-7f7c8ccc6e47	3	50	f	\N	\N
15fd4373-9fec-4845-b229-45beb91afcf4	\N	direct-grant-validate-username	6325ed20-8593-447d-95ca-17e4271cc794	0d74e352-10f0-4250-adc0-277e5b73c356	0	10	f	\N	\N
40b29eb0-9e44-4449-8102-0e9f59d983d5	\N	direct-grant-validate-password	6325ed20-8593-447d-95ca-17e4271cc794	0d74e352-10f0-4250-adc0-277e5b73c356	0	20	f	\N	\N
5888f623-f8ef-44c1-ab0e-ce3321ff9e90	\N	\N	6325ed20-8593-447d-95ca-17e4271cc794	0d74e352-10f0-4250-adc0-277e5b73c356	1	30	t	ee69c91b-6305-42fa-af34-f8a4e16b95b7	\N
b86b869c-ce12-4309-b111-7c3b4e64398a	\N	conditional-user-configured	6325ed20-8593-447d-95ca-17e4271cc794	ee69c91b-6305-42fa-af34-f8a4e16b95b7	0	10	f	\N	\N
659a1a49-c14d-40e0-9924-52b5a2d3f62d	\N	direct-grant-validate-otp	6325ed20-8593-447d-95ca-17e4271cc794	ee69c91b-6305-42fa-af34-f8a4e16b95b7	0	20	f	\N	\N
ad4682bd-59f3-47f6-a615-bb4d1cd18fa1	\N	registration-page-form	6325ed20-8593-447d-95ca-17e4271cc794	efc5d930-4e1f-465a-a9a8-8e76aa9a2e89	0	10	t	30c67fd4-1377-4023-9660-40f99b565a4a	\N
aff24d33-59d3-487c-a346-71f659c6d2ee	\N	registration-user-creation	6325ed20-8593-447d-95ca-17e4271cc794	30c67fd4-1377-4023-9660-40f99b565a4a	0	20	f	\N	\N
0b14d656-22d7-43ce-baed-f3e1ebde49f6	\N	registration-password-action	6325ed20-8593-447d-95ca-17e4271cc794	30c67fd4-1377-4023-9660-40f99b565a4a	0	50	f	\N	\N
4c44c8ee-cf4f-4010-b061-587e8116e1fa	\N	registration-recaptcha-action	6325ed20-8593-447d-95ca-17e4271cc794	30c67fd4-1377-4023-9660-40f99b565a4a	3	60	f	\N	\N
a5db7cf2-8b21-4dfc-9d06-bfe98023f77b	\N	registration-terms-and-conditions	6325ed20-8593-447d-95ca-17e4271cc794	30c67fd4-1377-4023-9660-40f99b565a4a	3	70	f	\N	\N
fa1132ad-d1ce-44df-8e4c-ed5bb3ff1a4e	\N	reset-credentials-choose-user	6325ed20-8593-447d-95ca-17e4271cc794	d3cabed6-baf9-499d-9b6f-1007c905d9a2	0	10	f	\N	\N
338838d1-f421-47ae-8e5c-c2f4139d7418	\N	reset-credential-email	6325ed20-8593-447d-95ca-17e4271cc794	d3cabed6-baf9-499d-9b6f-1007c905d9a2	0	20	f	\N	\N
a0d4f54c-1890-45ce-8cb5-3d955ab8d632	\N	reset-password	6325ed20-8593-447d-95ca-17e4271cc794	d3cabed6-baf9-499d-9b6f-1007c905d9a2	0	30	f	\N	\N
8ea791ba-d8bf-4a2d-b525-ee9ee4e3b276	\N	\N	6325ed20-8593-447d-95ca-17e4271cc794	d3cabed6-baf9-499d-9b6f-1007c905d9a2	1	40	t	6e8c7388-3534-4225-b320-ad26e8c12723	\N
a6a74e6a-7e9c-4f2a-9d4c-98ec75759346	\N	conditional-user-configured	6325ed20-8593-447d-95ca-17e4271cc794	6e8c7388-3534-4225-b320-ad26e8c12723	0	10	f	\N	\N
f2fc60ff-a639-471f-88f7-8a08d9406224	\N	reset-otp	6325ed20-8593-447d-95ca-17e4271cc794	6e8c7388-3534-4225-b320-ad26e8c12723	0	20	f	\N	\N
0db76f1f-6e93-4bde-a1a3-b649702393b1	\N	client-secret	6325ed20-8593-447d-95ca-17e4271cc794	d3d28c5e-602f-4e93-8a25-caa7e3930e6b	2	10	f	\N	\N
a309347f-23cf-40e5-a5f2-6fded8372fa3	\N	client-jwt	6325ed20-8593-447d-95ca-17e4271cc794	d3d28c5e-602f-4e93-8a25-caa7e3930e6b	2	20	f	\N	\N
33869570-0cd2-4d86-acd9-bd458b1ab211	\N	client-secret-jwt	6325ed20-8593-447d-95ca-17e4271cc794	d3d28c5e-602f-4e93-8a25-caa7e3930e6b	2	30	f	\N	\N
36bdd0ec-d550-4479-979c-d116d40cb42a	\N	client-x509	6325ed20-8593-447d-95ca-17e4271cc794	d3d28c5e-602f-4e93-8a25-caa7e3930e6b	2	40	f	\N	\N
42953d16-d66d-4d2d-afb7-ced02bca92a9	\N	idp-review-profile	6325ed20-8593-447d-95ca-17e4271cc794	a1db7761-bb8e-4e75-8417-ad30c7ca95d4	0	10	f	\N	d50853e8-357f-4257-935b-02ea55819b33
567fdae7-42d8-4ee0-b369-9e5c5e99d17e	\N	\N	6325ed20-8593-447d-95ca-17e4271cc794	a1db7761-bb8e-4e75-8417-ad30c7ca95d4	0	20	t	054a1ec4-31d2-45dd-9561-4492825ac589	\N
93ed43b7-b745-4198-ae14-9a31be2cec6b	\N	idp-create-user-if-unique	6325ed20-8593-447d-95ca-17e4271cc794	054a1ec4-31d2-45dd-9561-4492825ac589	2	10	f	\N	ee675019-5ef1-41ea-a3b5-c7300136c604
478a0159-120d-4aa8-ae93-3783ee2b0399	\N	\N	6325ed20-8593-447d-95ca-17e4271cc794	054a1ec4-31d2-45dd-9561-4492825ac589	2	20	t	b0baba78-89d0-458f-afd6-36cd570285d3	\N
22461a2c-4fe1-4171-a4f4-e39e5f79b9e8	\N	idp-confirm-link	6325ed20-8593-447d-95ca-17e4271cc794	b0baba78-89d0-458f-afd6-36cd570285d3	0	10	f	\N	\N
8f377c21-08c6-49a1-8aa7-cb876b0df7b1	\N	\N	6325ed20-8593-447d-95ca-17e4271cc794	b0baba78-89d0-458f-afd6-36cd570285d3	0	20	t	1c682943-2b1e-49c7-b1fe-b950a8d10bbd	\N
ddba154a-54a2-49e1-bc61-c0e7caa5d0ac	\N	idp-email-verification	6325ed20-8593-447d-95ca-17e4271cc794	1c682943-2b1e-49c7-b1fe-b950a8d10bbd	2	10	f	\N	\N
95508e75-ff6a-4c55-8c78-c5e87cffd86e	\N	\N	6325ed20-8593-447d-95ca-17e4271cc794	1c682943-2b1e-49c7-b1fe-b950a8d10bbd	2	20	t	8bc8722c-a877-4224-ac9f-5f6ffdd1ce79	\N
fc7a05df-c25c-43be-aa0b-bed7d2466b34	\N	idp-username-password-form	6325ed20-8593-447d-95ca-17e4271cc794	8bc8722c-a877-4224-ac9f-5f6ffdd1ce79	0	10	f	\N	\N
bfb20386-9d38-4965-bd97-0c6a23b25354	\N	\N	6325ed20-8593-447d-95ca-17e4271cc794	8bc8722c-a877-4224-ac9f-5f6ffdd1ce79	1	20	t	f50da32b-ec45-4486-9ba6-66ab39375d8e	\N
d57223a4-0181-4a38-8a05-ab8449466561	\N	conditional-user-configured	6325ed20-8593-447d-95ca-17e4271cc794	f50da32b-ec45-4486-9ba6-66ab39375d8e	0	10	f	\N	\N
24f22e32-45de-4133-a444-076ac01503e2	\N	conditional-credential	6325ed20-8593-447d-95ca-17e4271cc794	f50da32b-ec45-4486-9ba6-66ab39375d8e	0	20	f	\N	8e51ef92-4216-4d7f-9000-229aab925de4
a4b71ef7-3f91-45b1-b7d7-82f1434e9f96	\N	auth-otp-form	6325ed20-8593-447d-95ca-17e4271cc794	f50da32b-ec45-4486-9ba6-66ab39375d8e	2	30	f	\N	\N
2d031a9d-c633-4416-b5d2-7572ccac7913	\N	webauthn-authenticator	6325ed20-8593-447d-95ca-17e4271cc794	f50da32b-ec45-4486-9ba6-66ab39375d8e	3	40	f	\N	\N
34e9b0d5-5b42-4ffa-b70b-fcd1d2701238	\N	auth-recovery-authn-code-form	6325ed20-8593-447d-95ca-17e4271cc794	f50da32b-ec45-4486-9ba6-66ab39375d8e	3	50	f	\N	\N
9a06beb7-0990-478d-85b9-729ac7c6a3fd	\N	http-basic-authenticator	6325ed20-8593-447d-95ca-17e4271cc794	e82105ec-65ba-4099-a187-4c2faff932c8	0	10	f	\N	\N
2131ed70-ee5b-4811-abd7-ceb93dc08ba1	\N	docker-http-basic-authenticator	6325ed20-8593-447d-95ca-17e4271cc794	13564e44-48a1-40e1-80dd-8371ad82c240	0	10	f	\N	\N
68179ea2-d0fa-4a9e-a36d-0cf360daab57	\N	auth-cookie	5139da68-ccba-407f-a23e-8551400f5c1c	8b0508b8-e0f7-4513-aecf-d38a1389b933	2	10	f	\N	\N
f22f7a2b-652f-4e38-9388-e216c6c5be8f	\N	auth-spnego	5139da68-ccba-407f-a23e-8551400f5c1c	8b0508b8-e0f7-4513-aecf-d38a1389b933	3	20	f	\N	\N
050356f9-03eb-43cb-af64-5646678b9565	\N	identity-provider-redirector	5139da68-ccba-407f-a23e-8551400f5c1c	8b0508b8-e0f7-4513-aecf-d38a1389b933	2	25	f	\N	\N
0f6bf89c-6eff-4506-a64f-32e66ecdceb4	\N	\N	5139da68-ccba-407f-a23e-8551400f5c1c	8b0508b8-e0f7-4513-aecf-d38a1389b933	2	30	t	f1c38bc9-6f95-49ae-972d-5b997cb5c156	\N
978520b6-b6e8-4760-8563-356e1d79191d	\N	auth-username-password-form	5139da68-ccba-407f-a23e-8551400f5c1c	f1c38bc9-6f95-49ae-972d-5b997cb5c156	0	10	f	\N	\N
2b675a17-f322-413c-a117-8003518e3912	\N	\N	5139da68-ccba-407f-a23e-8551400f5c1c	f1c38bc9-6f95-49ae-972d-5b997cb5c156	1	20	t	980c99e1-7251-48f4-b00b-aa06131866e2	\N
d0fc1b3c-aef7-4cb5-b3b0-bca787bf6a60	\N	conditional-user-configured	5139da68-ccba-407f-a23e-8551400f5c1c	980c99e1-7251-48f4-b00b-aa06131866e2	0	10	f	\N	\N
557c7f71-38c6-495e-884a-4784dda8257f	\N	conditional-credential	5139da68-ccba-407f-a23e-8551400f5c1c	980c99e1-7251-48f4-b00b-aa06131866e2	0	20	f	\N	216f5de1-46e5-47ea-a5fb-26d50355b3e8
a493edf9-d508-4f75-af56-e39351a2aa41	\N	auth-otp-form	5139da68-ccba-407f-a23e-8551400f5c1c	980c99e1-7251-48f4-b00b-aa06131866e2	2	30	f	\N	\N
a3cb7d3c-f8cb-47fe-b76f-acbc44cb2601	\N	webauthn-authenticator	5139da68-ccba-407f-a23e-8551400f5c1c	980c99e1-7251-48f4-b00b-aa06131866e2	3	40	f	\N	\N
9d1e8a0c-0728-4be2-b340-02b2369f427a	\N	auth-recovery-authn-code-form	5139da68-ccba-407f-a23e-8551400f5c1c	980c99e1-7251-48f4-b00b-aa06131866e2	3	50	f	\N	\N
6717010c-bb04-42d5-8349-3883e9cfc0ea	\N	\N	5139da68-ccba-407f-a23e-8551400f5c1c	8b0508b8-e0f7-4513-aecf-d38a1389b933	2	26	t	061d6c97-5195-4415-9ad4-f43af3ebf1ae	\N
7325a219-a1e6-449d-862b-74a41ebf5050	\N	\N	5139da68-ccba-407f-a23e-8551400f5c1c	061d6c97-5195-4415-9ad4-f43af3ebf1ae	1	10	t	fb5f31c4-9672-470f-98ce-3acf504eeb8a	\N
a2c2fced-960b-4b65-a42e-fc66b86f0b4a	\N	conditional-user-configured	5139da68-ccba-407f-a23e-8551400f5c1c	fb5f31c4-9672-470f-98ce-3acf504eeb8a	0	10	f	\N	\N
52a875fe-7f99-4d62-87b5-a9b355e327a3	\N	organization	5139da68-ccba-407f-a23e-8551400f5c1c	fb5f31c4-9672-470f-98ce-3acf504eeb8a	2	20	f	\N	\N
da579d93-d189-46ec-b29e-7c6db69e6a31	\N	direct-grant-validate-username	5139da68-ccba-407f-a23e-8551400f5c1c	df48b5be-7e69-43f1-a384-5727239da1d5	0	10	f	\N	\N
ac03e7a9-7a0f-4b70-aa98-3b934c03d1cd	\N	direct-grant-validate-password	5139da68-ccba-407f-a23e-8551400f5c1c	df48b5be-7e69-43f1-a384-5727239da1d5	0	20	f	\N	\N
c2f833bc-c79e-457b-ae41-b729ba1cd5a2	\N	\N	5139da68-ccba-407f-a23e-8551400f5c1c	df48b5be-7e69-43f1-a384-5727239da1d5	1	30	t	181d5768-7aa1-444f-8738-10d37bf6c80a	\N
96088026-f82a-47e0-b8aa-991b2c467231	\N	conditional-user-configured	5139da68-ccba-407f-a23e-8551400f5c1c	181d5768-7aa1-444f-8738-10d37bf6c80a	0	10	f	\N	\N
0525a820-e880-493a-be45-a80cd14d6b93	\N	direct-grant-validate-otp	5139da68-ccba-407f-a23e-8551400f5c1c	181d5768-7aa1-444f-8738-10d37bf6c80a	0	20	f	\N	\N
882b8788-a1de-406e-9fbc-1bfb09608abb	\N	registration-page-form	5139da68-ccba-407f-a23e-8551400f5c1c	eb2ec5ef-ec6f-420f-ae02-a18972811528	0	10	t	e19585c3-f891-44e7-b2b3-d51dbca947e0	\N
2a2aa620-56de-43ff-b4ab-a6c44ba8e36d	\N	registration-user-creation	5139da68-ccba-407f-a23e-8551400f5c1c	e19585c3-f891-44e7-b2b3-d51dbca947e0	0	20	f	\N	\N
d820872c-3150-4d45-9386-cdef66dc1abb	\N	registration-password-action	5139da68-ccba-407f-a23e-8551400f5c1c	e19585c3-f891-44e7-b2b3-d51dbca947e0	0	50	f	\N	\N
7f91d603-c6dc-4c66-9437-6e71575c04f9	\N	registration-recaptcha-action	5139da68-ccba-407f-a23e-8551400f5c1c	e19585c3-f891-44e7-b2b3-d51dbca947e0	3	60	f	\N	\N
5ee0d822-dfd6-4970-9a96-a46430794d3f	\N	registration-terms-and-conditions	5139da68-ccba-407f-a23e-8551400f5c1c	e19585c3-f891-44e7-b2b3-d51dbca947e0	3	70	f	\N	\N
3a389fee-2af4-4908-be2d-5e28b25815f9	\N	reset-credentials-choose-user	5139da68-ccba-407f-a23e-8551400f5c1c	1e5aa93b-93fd-43bb-ae5e-5bd85f5cb030	0	10	f	\N	\N
98054ddc-155e-4ede-a91a-130aef120f27	\N	reset-credential-email	5139da68-ccba-407f-a23e-8551400f5c1c	1e5aa93b-93fd-43bb-ae5e-5bd85f5cb030	0	20	f	\N	\N
8fc95ecd-83e3-4fa7-9816-f19106f8d146	\N	reset-password	5139da68-ccba-407f-a23e-8551400f5c1c	1e5aa93b-93fd-43bb-ae5e-5bd85f5cb030	0	30	f	\N	\N
28b32070-abe1-45cc-ae26-525570b54949	\N	\N	5139da68-ccba-407f-a23e-8551400f5c1c	1e5aa93b-93fd-43bb-ae5e-5bd85f5cb030	1	40	t	4230584b-8b35-439a-b651-31acea375a22	\N
f564b48f-27a6-4ac5-a98f-62e580729ce6	\N	conditional-user-configured	5139da68-ccba-407f-a23e-8551400f5c1c	4230584b-8b35-439a-b651-31acea375a22	0	10	f	\N	\N
10186571-3757-435e-b65a-37b70117ba00	\N	reset-otp	5139da68-ccba-407f-a23e-8551400f5c1c	4230584b-8b35-439a-b651-31acea375a22	0	20	f	\N	\N
c812218c-d26d-42ce-8aa3-15dbbc7b7297	\N	client-secret	5139da68-ccba-407f-a23e-8551400f5c1c	4b249ead-204a-46e9-89b7-4de364d0a0fe	2	10	f	\N	\N
dc30a0e8-920c-474d-83f1-331a49cd5594	\N	client-jwt	5139da68-ccba-407f-a23e-8551400f5c1c	4b249ead-204a-46e9-89b7-4de364d0a0fe	2	20	f	\N	\N
9355702f-f48d-4422-8e5b-d3f812f4d5be	\N	client-secret-jwt	5139da68-ccba-407f-a23e-8551400f5c1c	4b249ead-204a-46e9-89b7-4de364d0a0fe	2	30	f	\N	\N
22e1559b-2331-409b-ac30-94bddeb8c728	\N	client-x509	5139da68-ccba-407f-a23e-8551400f5c1c	4b249ead-204a-46e9-89b7-4de364d0a0fe	2	40	f	\N	\N
e2a63d0f-be8f-45d2-88ae-ea336012e911	\N	idp-review-profile	5139da68-ccba-407f-a23e-8551400f5c1c	39e6a851-4bcb-4c3b-9ccf-0ba4f45a3ce1	0	10	f	\N	194e327b-3002-4f4c-b98e-a2a1986fc78f
503d4884-3c49-4b7c-8c62-2faa2b4059f5	\N	\N	5139da68-ccba-407f-a23e-8551400f5c1c	39e6a851-4bcb-4c3b-9ccf-0ba4f45a3ce1	0	20	t	29c7110d-f42e-454e-863a-c8d2aa28cfcf	\N
88739ed9-7731-4427-a6e6-95734d39c873	\N	idp-create-user-if-unique	5139da68-ccba-407f-a23e-8551400f5c1c	29c7110d-f42e-454e-863a-c8d2aa28cfcf	2	10	f	\N	83368c0b-a073-4089-b33b-365bf9ab4d2f
2a54a3ac-3dfc-4aa3-8f51-813f24f19a86	\N	\N	5139da68-ccba-407f-a23e-8551400f5c1c	29c7110d-f42e-454e-863a-c8d2aa28cfcf	2	20	t	f451b75d-f010-453a-a0b4-6c4d61fea315	\N
0d0e7f93-86bf-4fe7-ae2c-5476331570f6	\N	idp-confirm-link	5139da68-ccba-407f-a23e-8551400f5c1c	f451b75d-f010-453a-a0b4-6c4d61fea315	0	10	f	\N	\N
d48d7f7b-7b72-49b5-b625-d9c71b20b620	\N	\N	5139da68-ccba-407f-a23e-8551400f5c1c	f451b75d-f010-453a-a0b4-6c4d61fea315	0	20	t	1031db13-0f6c-42a9-b8ce-981978326c86	\N
b294c84d-f7a6-4291-b92f-ca2154fd70b9	\N	idp-email-verification	5139da68-ccba-407f-a23e-8551400f5c1c	1031db13-0f6c-42a9-b8ce-981978326c86	2	10	f	\N	\N
2acefab2-ac6c-47c4-aee9-40c6e4ff0edc	\N	\N	5139da68-ccba-407f-a23e-8551400f5c1c	1031db13-0f6c-42a9-b8ce-981978326c86	2	20	t	4efa59d8-2ea5-4193-b7d9-268cd8967fbe	\N
0a890a44-6477-4fec-9a60-1c37ed7cffdf	\N	idp-username-password-form	5139da68-ccba-407f-a23e-8551400f5c1c	4efa59d8-2ea5-4193-b7d9-268cd8967fbe	0	10	f	\N	\N
5275fea6-4bf2-4b0c-81f2-5e977a6ffedd	\N	\N	5139da68-ccba-407f-a23e-8551400f5c1c	4efa59d8-2ea5-4193-b7d9-268cd8967fbe	1	20	t	f87eec99-931f-4adc-bd85-c4c4b8d8de09	\N
f9be1a69-4854-4126-9e98-862e5b10e3e8	\N	conditional-user-configured	5139da68-ccba-407f-a23e-8551400f5c1c	f87eec99-931f-4adc-bd85-c4c4b8d8de09	0	10	f	\N	\N
4f4cad62-dd0f-443e-9805-89780ca48cf7	\N	conditional-credential	5139da68-ccba-407f-a23e-8551400f5c1c	f87eec99-931f-4adc-bd85-c4c4b8d8de09	0	20	f	\N	db89504c-68d6-4dcf-be14-ad1f0dcf0bee
48a97a02-8822-412f-9841-015ab83c02e0	\N	auth-otp-form	5139da68-ccba-407f-a23e-8551400f5c1c	f87eec99-931f-4adc-bd85-c4c4b8d8de09	2	30	f	\N	\N
00ae7220-cdee-4150-9680-bf7eba502f6f	\N	webauthn-authenticator	5139da68-ccba-407f-a23e-8551400f5c1c	f87eec99-931f-4adc-bd85-c4c4b8d8de09	3	40	f	\N	\N
23383132-ebd8-42ad-9e3d-7f29c6a52ac2	\N	auth-recovery-authn-code-form	5139da68-ccba-407f-a23e-8551400f5c1c	f87eec99-931f-4adc-bd85-c4c4b8d8de09	3	50	f	\N	\N
09211924-8f97-41be-b65b-c36c1b11abb5	\N	\N	5139da68-ccba-407f-a23e-8551400f5c1c	39e6a851-4bcb-4c3b-9ccf-0ba4f45a3ce1	1	60	t	a79396e9-0f7b-4cbb-8a2c-226ff664ab8b	\N
6ce4d4e5-d08e-45a6-8ad6-4299e00cae58	\N	conditional-user-configured	5139da68-ccba-407f-a23e-8551400f5c1c	a79396e9-0f7b-4cbb-8a2c-226ff664ab8b	0	10	f	\N	\N
9962084e-4ccc-43ae-af6c-6f7b4793af6b	\N	idp-add-organization-member	5139da68-ccba-407f-a23e-8551400f5c1c	a79396e9-0f7b-4cbb-8a2c-226ff664ab8b	0	20	f	\N	\N
9a0d2654-874d-4eec-b46a-4e80c91a088e	\N	http-basic-authenticator	5139da68-ccba-407f-a23e-8551400f5c1c	947dda34-33ab-488a-9aeb-e4677e616742	0	10	f	\N	\N
c03556c1-415b-46ce-ac8e-013783b8e53c	\N	docker-http-basic-authenticator	5139da68-ccba-407f-a23e-8551400f5c1c	c2840e47-6220-41bb-8af8-668eeba86537	0	10	f	\N	\N
\.


-- ============================================================================
-- Data for table: authenticator_config
-- ============================================================================

COPY public.authenticator_config (id, alias, realm_id) FROM stdin;
1f567c73-d717-4ab1-907a-5f4382aa4cd7	browser-conditional-credential	6325ed20-8593-447d-95ca-17e4271cc794
d50853e8-357f-4257-935b-02ea55819b33	review profile config	6325ed20-8593-447d-95ca-17e4271cc794
ee675019-5ef1-41ea-a3b5-c7300136c604	create unique user config	6325ed20-8593-447d-95ca-17e4271cc794
8e51ef92-4216-4d7f-9000-229aab925de4	first-broker-login-conditional-credential	6325ed20-8593-447d-95ca-17e4271cc794
216f5de1-46e5-47ea-a5fb-26d50355b3e8	browser-conditional-credential	5139da68-ccba-407f-a23e-8551400f5c1c
194e327b-3002-4f4c-b98e-a2a1986fc78f	review profile config	5139da68-ccba-407f-a23e-8551400f5c1c
83368c0b-a073-4089-b33b-365bf9ab4d2f	create unique user config	5139da68-ccba-407f-a23e-8551400f5c1c
db89504c-68d6-4dcf-be14-ad1f0dcf0bee	first-broker-login-conditional-credential	5139da68-ccba-407f-a23e-8551400f5c1c
\.


-- ============================================================================
-- Data for table: authenticator_config_entry
-- ============================================================================

COPY public.authenticator_config_entry (authenticator_id, value, name) FROM stdin;
1f567c73-d717-4ab1-907a-5f4382aa4cd7	webauthn-passwordless	credentials
8e51ef92-4216-4d7f-9000-229aab925de4	webauthn-passwordless	credentials
d50853e8-357f-4257-935b-02ea55819b33	missing	update.profile.on.first.login
ee675019-5ef1-41ea-a3b5-c7300136c604	false	require.password.update.after.registration
194e327b-3002-4f4c-b98e-a2a1986fc78f	missing	update.profile.on.first.login
216f5de1-46e5-47ea-a5fb-26d50355b3e8	webauthn-passwordless	credentials
83368c0b-a073-4089-b33b-365bf9ab4d2f	false	require.password.update.after.registration
db89504c-68d6-4dcf-be14-ad1f0dcf0bee	webauthn-passwordless	credentials
\.


-- ============================================================================
-- Data for table: required_action_provider
-- ============================================================================

COPY public.required_action_provider (id, alias, name, realm_id, enabled, default_action, provider_id, priority) FROM stdin;
765e9a23-9f52-436b-a906-58ee2a8ebc72	VERIFY_EMAIL	Verify Email	6325ed20-8593-447d-95ca-17e4271cc794	t	f	VERIFY_EMAIL	50
f2d509dc-4e55-4210-b3b1-f50f7ad52690	UPDATE_PROFILE	Update Profile	6325ed20-8593-447d-95ca-17e4271cc794	t	f	UPDATE_PROFILE	40
24a1b2d3-6630-4f1f-ba94-4af622c1ed63	CONFIGURE_TOTP	Configure OTP	6325ed20-8593-447d-95ca-17e4271cc794	t	f	CONFIGURE_TOTP	10
ac567b1c-d044-4984-bc62-b815f6bfcdea	UPDATE_PASSWORD	Update Password	6325ed20-8593-447d-95ca-17e4271cc794	t	f	UPDATE_PASSWORD	30
60a6296e-3d87-4a35-8d00-6eef4f43decb	TERMS_AND_CONDITIONS	Terms and Conditions	6325ed20-8593-447d-95ca-17e4271cc794	f	f	TERMS_AND_CONDITIONS	20
dd6eb6dc-dad3-4f53-90b1-ce011bdfb0a7	delete_account	Delete Account	6325ed20-8593-447d-95ca-17e4271cc794	f	f	delete_account	60
f6ed5371-8db7-458c-9f90-86322800644a	delete_credential	Delete Credential	6325ed20-8593-447d-95ca-17e4271cc794	t	f	delete_credential	110
41398588-40c2-48ed-a0b0-44e5a6a08a21	update_user_locale	Update User Locale	6325ed20-8593-447d-95ca-17e4271cc794	t	f	update_user_locale	1000
d5520712-c166-44fa-b2cb-ce88eb30b565	UPDATE_EMAIL	Update Email	6325ed20-8593-447d-95ca-17e4271cc794	f	f	UPDATE_EMAIL	70
8c6af2ec-23e8-4d2d-b6e3-2df2a4e03588	CONFIGURE_RECOVERY_AUTHN_CODES	Recovery Authentication Codes	6325ed20-8593-447d-95ca-17e4271cc794	t	f	CONFIGURE_RECOVERY_AUTHN_CODES	130
32712009-2481-43f9-8d21-288fd48ed0fc	webauthn-register	Webauthn Register	6325ed20-8593-447d-95ca-17e4271cc794	t	f	webauthn-register	80
ba2c3993-fbcf-4d1c-9017-236a69df141a	webauthn-register-passwordless	Webauthn Register Passwordless	6325ed20-8593-447d-95ca-17e4271cc794	t	f	webauthn-register-passwordless	90
4f0c69ec-d3af-41a6-86a7-16c8bcf9e08f	VERIFY_PROFILE	Verify Profile	6325ed20-8593-447d-95ca-17e4271cc794	t	f	VERIFY_PROFILE	100
a33c4357-d6ea-4a58-a458-1cc7cbba73ed	idp_link	Linking Identity Provider	6325ed20-8593-447d-95ca-17e4271cc794	t	f	idp_link	120
d7533151-a1f2-4b96-b251-30fa4fd94f36	VERIFY_EMAIL	Verify Email	5139da68-ccba-407f-a23e-8551400f5c1c	t	f	VERIFY_EMAIL	50
b4a31482-d9d5-40c1-b66f-ccd98f9ddae5	UPDATE_PROFILE	Update Profile	5139da68-ccba-407f-a23e-8551400f5c1c	t	f	UPDATE_PROFILE	40
4ec567ed-4e0f-47ef-898e-c832a1e27598	CONFIGURE_TOTP	Configure OTP	5139da68-ccba-407f-a23e-8551400f5c1c	t	f	CONFIGURE_TOTP	10
a4b0fb45-f51c-4a3d-b613-4204065053fb	UPDATE_PASSWORD	Update Password	5139da68-ccba-407f-a23e-8551400f5c1c	t	f	UPDATE_PASSWORD	30
2c1ce902-4254-4619-a22b-a9f3ca41222e	TERMS_AND_CONDITIONS	Terms and Conditions	5139da68-ccba-407f-a23e-8551400f5c1c	f	f	TERMS_AND_CONDITIONS	20
b728fb1a-167b-4a8d-9c4a-113cc64cd802	delete_account	Delete Account	5139da68-ccba-407f-a23e-8551400f5c1c	f	f	delete_account	60
cda76ccc-9229-40c9-9a2a-5f8648a90bb0	delete_credential	Delete Credential	5139da68-ccba-407f-a23e-8551400f5c1c	t	f	delete_credential	110
dc5c2f5e-3a19-4833-a65e-cb6a76bec0ef	update_user_locale	Update User Locale	5139da68-ccba-407f-a23e-8551400f5c1c	t	f	update_user_locale	1000
1114a3ff-de6c-4374-b670-061d68561193	UPDATE_EMAIL	Update Email	5139da68-ccba-407f-a23e-8551400f5c1c	f	f	UPDATE_EMAIL	70
2b81d924-6c39-4796-83cf-2dd8ab72d825	CONFIGURE_RECOVERY_AUTHN_CODES	Recovery Authentication Codes	5139da68-ccba-407f-a23e-8551400f5c1c	t	f	CONFIGURE_RECOVERY_AUTHN_CODES	130
089da1e2-d036-46d4-8020-640fb40c9e1d	webauthn-register	Webauthn Register	5139da68-ccba-407f-a23e-8551400f5c1c	t	f	webauthn-register	80
015786b2-0870-4b00-abf5-a4942b87f4cd	webauthn-register-passwordless	Webauthn Register Passwordless	5139da68-ccba-407f-a23e-8551400f5c1c	t	f	webauthn-register-passwordless	90
35079bb4-0364-4019-a1ad-6311c1dca624	VERIFY_PROFILE	Verify Profile	5139da68-ccba-407f-a23e-8551400f5c1c	t	f	VERIFY_PROFILE	100
09f70300-42dd-4054-89c5-3cf1d1fa9e83	idp_link	Linking Identity Provider	5139da68-ccba-407f-a23e-8551400f5c1c	t	f	idp_link	120
\.


-- ============================================================================
-- Data for table: client_scope
-- ============================================================================

COPY public.client_scope (id, name, realm_id, description, protocol) FROM stdin;
09da4011-b8ad-4180-820c-5c38ee856d10	offline_access	6325ed20-8593-447d-95ca-17e4271cc794	OpenID Connect built-in scope: offline_access	openid-connect
f66c2fea-eca9-4232-9e8c-767c20c9f14d	role_list	6325ed20-8593-447d-95ca-17e4271cc794	SAML role list	saml
fe9b7ea7-dd1b-4a89-9399-da1c73f16821	saml_organization	6325ed20-8593-447d-95ca-17e4271cc794	Organization Membership	saml
f95ebb75-3d04-4b6a-aff6-b102d958c617	profile	6325ed20-8593-447d-95ca-17e4271cc794	OpenID Connect built-in scope: profile	openid-connect
77ae95dd-ba17-43a3-b946-fde1c76fbfd7	email	6325ed20-8593-447d-95ca-17e4271cc794	OpenID Connect built-in scope: email	openid-connect
22f363a8-20cb-4ff7-9978-c0b85c15b032	address	6325ed20-8593-447d-95ca-17e4271cc794	OpenID Connect built-in scope: address	openid-connect
089d4ac1-e772-4c0f-8468-a988187eb2f8	phone	6325ed20-8593-447d-95ca-17e4271cc794	OpenID Connect built-in scope: phone	openid-connect
a57da4d7-c70d-4013-8249-1708182e7fc4	roles	6325ed20-8593-447d-95ca-17e4271cc794	OpenID Connect scope for add user roles to the access token	openid-connect
6eff8a14-65f5-4f6f-8e6f-ac023722bcbd	web-origins	6325ed20-8593-447d-95ca-17e4271cc794	OpenID Connect scope for add allowed web origins to the access token	openid-connect
2297ec95-fb7e-44dd-ab7a-d01af16bff7e	microprofile-jwt	6325ed20-8593-447d-95ca-17e4271cc794	Microprofile - JWT built-in scope	openid-connect
b173ffe5-760d-43e6-8aaa-4ec549088e12	acr	6325ed20-8593-447d-95ca-17e4271cc794	OpenID Connect scope for add acr (authentication context class reference) to the token	openid-connect
4a7c11b1-c523-4108-a4ee-c1ffc4583e70	basic	6325ed20-8593-447d-95ca-17e4271cc794	OpenID Connect scope for add all basic claims to the token	openid-connect
c2aec92a-b876-4ef8-bf6e-6b637129fa6c	service_account	6325ed20-8593-447d-95ca-17e4271cc794	Specific scope for a client enabled for service accounts	openid-connect
537cf519-d0ac-4adc-b2cd-68c7668814dc	organization	6325ed20-8593-447d-95ca-17e4271cc794	Additional claims about the organization a subject belongs to	openid-connect
14976545-421c-43b3-bb3f-b293afc9c547	offline_access	5139da68-ccba-407f-a23e-8551400f5c1c	OpenID Connect built-in scope: offline_access	openid-connect
9c01334e-cb09-4d99-b846-52eb1af860c3	role_list	5139da68-ccba-407f-a23e-8551400f5c1c	SAML role list	saml
a8b3983e-86ad-44e4-8e6e-615c805f5882	saml_organization	5139da68-ccba-407f-a23e-8551400f5c1c	Organization Membership	saml
7c2e690d-4dbe-4db5-95f7-a442ef604491	profile	5139da68-ccba-407f-a23e-8551400f5c1c	OpenID Connect built-in scope: profile	openid-connect
bcd37f59-ed5c-40c9-b652-949cbf49400a	email	5139da68-ccba-407f-a23e-8551400f5c1c	OpenID Connect built-in scope: email	openid-connect
a2c00dbd-7f83-49af-a9eb-f79955833828	address	5139da68-ccba-407f-a23e-8551400f5c1c	OpenID Connect built-in scope: address	openid-connect
ca6bb65b-d7f7-4b12-8556-71ce24281f5b	phone	5139da68-ccba-407f-a23e-8551400f5c1c	OpenID Connect built-in scope: phone	openid-connect
8582706b-beb9-4d3e-b344-51d74607e667	roles	5139da68-ccba-407f-a23e-8551400f5c1c	OpenID Connect scope for add user roles to the access token	openid-connect
ffd53e84-6a72-477d-808e-33af9e9b62c8	web-origins	5139da68-ccba-407f-a23e-8551400f5c1c	OpenID Connect scope for add allowed web origins to the access token	openid-connect
b751d23f-d322-44b9-821e-b15ce5141342	microprofile-jwt	5139da68-ccba-407f-a23e-8551400f5c1c	Microprofile - JWT built-in scope	openid-connect
7ba45907-eb11-491c-97aa-dee8366525e8	acr	5139da68-ccba-407f-a23e-8551400f5c1c	OpenID Connect scope for add acr (authentication context class reference) to the token	openid-connect
51faf3ac-5cc1-4c08-a419-6d4abd222139	basic	5139da68-ccba-407f-a23e-8551400f5c1c	OpenID Connect scope for add all basic claims to the token	openid-connect
852a6cf6-0f88-4599-8601-ef489f87e1f0	service_account	5139da68-ccba-407f-a23e-8551400f5c1c	Specific scope for a client enabled for service accounts	openid-connect
9951b853-760d-43f0-b7dc-2d20d382c9d6	organization	5139da68-ccba-407f-a23e-8551400f5c1c	Additional claims about the organization a subject belongs to	openid-connect
\.


-- ============================================================================
-- Data for table: client_scope_attributes
-- ============================================================================

COPY public.client_scope_attributes (scope_id, value, name) FROM stdin;
09da4011-b8ad-4180-820c-5c38ee856d10	true	display.on.consent.screen
09da4011-b8ad-4180-820c-5c38ee856d10	${offlineAccessScopeConsentText}	consent.screen.text
f66c2fea-eca9-4232-9e8c-767c20c9f14d	true	display.on.consent.screen
f66c2fea-eca9-4232-9e8c-767c20c9f14d	${samlRoleListScopeConsentText}	consent.screen.text
fe9b7ea7-dd1b-4a89-9399-da1c73f16821	false	display.on.consent.screen
f95ebb75-3d04-4b6a-aff6-b102d958c617	true	display.on.consent.screen
f95ebb75-3d04-4b6a-aff6-b102d958c617	${profileScopeConsentText}	consent.screen.text
f95ebb75-3d04-4b6a-aff6-b102d958c617	true	include.in.token.scope
77ae95dd-ba17-43a3-b946-fde1c76fbfd7	true	display.on.consent.screen
77ae95dd-ba17-43a3-b946-fde1c76fbfd7	${emailScopeConsentText}	consent.screen.text
77ae95dd-ba17-43a3-b946-fde1c76fbfd7	true	include.in.token.scope
22f363a8-20cb-4ff7-9978-c0b85c15b032	true	display.on.consent.screen
22f363a8-20cb-4ff7-9978-c0b85c15b032	${addressScopeConsentText}	consent.screen.text
22f363a8-20cb-4ff7-9978-c0b85c15b032	true	include.in.token.scope
089d4ac1-e772-4c0f-8468-a988187eb2f8	true	display.on.consent.screen
089d4ac1-e772-4c0f-8468-a988187eb2f8	${phoneScopeConsentText}	consent.screen.text
089d4ac1-e772-4c0f-8468-a988187eb2f8	true	include.in.token.scope
a57da4d7-c70d-4013-8249-1708182e7fc4	true	display.on.consent.screen
a57da4d7-c70d-4013-8249-1708182e7fc4	${rolesScopeConsentText}	consent.screen.text
a57da4d7-c70d-4013-8249-1708182e7fc4	false	include.in.token.scope
6eff8a14-65f5-4f6f-8e6f-ac023722bcbd	false	display.on.consent.screen
6eff8a14-65f5-4f6f-8e6f-ac023722bcbd		consent.screen.text
6eff8a14-65f5-4f6f-8e6f-ac023722bcbd	false	include.in.token.scope
2297ec95-fb7e-44dd-ab7a-d01af16bff7e	false	display.on.consent.screen
2297ec95-fb7e-44dd-ab7a-d01af16bff7e	true	include.in.token.scope
b173ffe5-760d-43e6-8aaa-4ec549088e12	false	display.on.consent.screen
b173ffe5-760d-43e6-8aaa-4ec549088e12	false	include.in.token.scope
4a7c11b1-c523-4108-a4ee-c1ffc4583e70	false	display.on.consent.screen
4a7c11b1-c523-4108-a4ee-c1ffc4583e70	false	include.in.token.scope
c2aec92a-b876-4ef8-bf6e-6b637129fa6c	false	display.on.consent.screen
c2aec92a-b876-4ef8-bf6e-6b637129fa6c	false	include.in.token.scope
537cf519-d0ac-4adc-b2cd-68c7668814dc	true	display.on.consent.screen
537cf519-d0ac-4adc-b2cd-68c7668814dc	${organizationScopeConsentText}	consent.screen.text
537cf519-d0ac-4adc-b2cd-68c7668814dc	true	include.in.token.scope
14976545-421c-43b3-bb3f-b293afc9c547	true	display.on.consent.screen
14976545-421c-43b3-bb3f-b293afc9c547	${offlineAccessScopeConsentText}	consent.screen.text
9c01334e-cb09-4d99-b846-52eb1af860c3	true	display.on.consent.screen
9c01334e-cb09-4d99-b846-52eb1af860c3	${samlRoleListScopeConsentText}	consent.screen.text
a8b3983e-86ad-44e4-8e6e-615c805f5882	false	display.on.consent.screen
7c2e690d-4dbe-4db5-95f7-a442ef604491	true	display.on.consent.screen
7c2e690d-4dbe-4db5-95f7-a442ef604491	${profileScopeConsentText}	consent.screen.text
7c2e690d-4dbe-4db5-95f7-a442ef604491	true	include.in.token.scope
bcd37f59-ed5c-40c9-b652-949cbf49400a	true	display.on.consent.screen
bcd37f59-ed5c-40c9-b652-949cbf49400a	${emailScopeConsentText}	consent.screen.text
bcd37f59-ed5c-40c9-b652-949cbf49400a	true	include.in.token.scope
a2c00dbd-7f83-49af-a9eb-f79955833828	true	display.on.consent.screen
a2c00dbd-7f83-49af-a9eb-f79955833828	${addressScopeConsentText}	consent.screen.text
a2c00dbd-7f83-49af-a9eb-f79955833828	true	include.in.token.scope
ca6bb65b-d7f7-4b12-8556-71ce24281f5b	true	display.on.consent.screen
ca6bb65b-d7f7-4b12-8556-71ce24281f5b	${phoneScopeConsentText}	consent.screen.text
ca6bb65b-d7f7-4b12-8556-71ce24281f5b	true	include.in.token.scope
8582706b-beb9-4d3e-b344-51d74607e667	true	display.on.consent.screen
8582706b-beb9-4d3e-b344-51d74607e667	${rolesScopeConsentText}	consent.screen.text
8582706b-beb9-4d3e-b344-51d74607e667	false	include.in.token.scope
ffd53e84-6a72-477d-808e-33af9e9b62c8	false	display.on.consent.screen
ffd53e84-6a72-477d-808e-33af9e9b62c8		consent.screen.text
ffd53e84-6a72-477d-808e-33af9e9b62c8	false	include.in.token.scope
b751d23f-d322-44b9-821e-b15ce5141342	false	display.on.consent.screen
b751d23f-d322-44b9-821e-b15ce5141342	true	include.in.token.scope
7ba45907-eb11-491c-97aa-dee8366525e8	false	display.on.consent.screen
7ba45907-eb11-491c-97aa-dee8366525e8	false	include.in.token.scope
51faf3ac-5cc1-4c08-a419-6d4abd222139	false	display.on.consent.screen
51faf3ac-5cc1-4c08-a419-6d4abd222139	false	include.in.token.scope
852a6cf6-0f88-4599-8601-ef489f87e1f0	false	display.on.consent.screen
852a6cf6-0f88-4599-8601-ef489f87e1f0	false	include.in.token.scope
9951b853-760d-43f0-b7dc-2d20d382c9d6	true	display.on.consent.screen
9951b853-760d-43f0-b7dc-2d20d382c9d6	${organizationScopeConsentText}	consent.screen.text
9951b853-760d-43f0-b7dc-2d20d382c9d6	true	include.in.token.scope
\.


-- ============================================================================
-- Data for table: default_client_scope
-- ============================================================================

COPY public.default_client_scope (realm_id, scope_id, default_scope) FROM stdin;
6325ed20-8593-447d-95ca-17e4271cc794	09da4011-b8ad-4180-820c-5c38ee856d10	f
6325ed20-8593-447d-95ca-17e4271cc794	f66c2fea-eca9-4232-9e8c-767c20c9f14d	t
6325ed20-8593-447d-95ca-17e4271cc794	fe9b7ea7-dd1b-4a89-9399-da1c73f16821	t
6325ed20-8593-447d-95ca-17e4271cc794	f95ebb75-3d04-4b6a-aff6-b102d958c617	t
6325ed20-8593-447d-95ca-17e4271cc794	77ae95dd-ba17-43a3-b946-fde1c76fbfd7	t
6325ed20-8593-447d-95ca-17e4271cc794	22f363a8-20cb-4ff7-9978-c0b85c15b032	f
6325ed20-8593-447d-95ca-17e4271cc794	089d4ac1-e772-4c0f-8468-a988187eb2f8	f
6325ed20-8593-447d-95ca-17e4271cc794	a57da4d7-c70d-4013-8249-1708182e7fc4	t
6325ed20-8593-447d-95ca-17e4271cc794	6eff8a14-65f5-4f6f-8e6f-ac023722bcbd	t
6325ed20-8593-447d-95ca-17e4271cc794	2297ec95-fb7e-44dd-ab7a-d01af16bff7e	f
6325ed20-8593-447d-95ca-17e4271cc794	b173ffe5-760d-43e6-8aaa-4ec549088e12	t
6325ed20-8593-447d-95ca-17e4271cc794	4a7c11b1-c523-4108-a4ee-c1ffc4583e70	t
6325ed20-8593-447d-95ca-17e4271cc794	537cf519-d0ac-4adc-b2cd-68c7668814dc	f
5139da68-ccba-407f-a23e-8551400f5c1c	14976545-421c-43b3-bb3f-b293afc9c547	f
5139da68-ccba-407f-a23e-8551400f5c1c	9c01334e-cb09-4d99-b846-52eb1af860c3	t
5139da68-ccba-407f-a23e-8551400f5c1c	a8b3983e-86ad-44e4-8e6e-615c805f5882	t
5139da68-ccba-407f-a23e-8551400f5c1c	7c2e690d-4dbe-4db5-95f7-a442ef604491	t
5139da68-ccba-407f-a23e-8551400f5c1c	bcd37f59-ed5c-40c9-b652-949cbf49400a	t
5139da68-ccba-407f-a23e-8551400f5c1c	a2c00dbd-7f83-49af-a9eb-f79955833828	f
5139da68-ccba-407f-a23e-8551400f5c1c	ca6bb65b-d7f7-4b12-8556-71ce24281f5b	f
5139da68-ccba-407f-a23e-8551400f5c1c	8582706b-beb9-4d3e-b344-51d74607e667	t
5139da68-ccba-407f-a23e-8551400f5c1c	ffd53e84-6a72-477d-808e-33af9e9b62c8	t
5139da68-ccba-407f-a23e-8551400f5c1c	b751d23f-d322-44b9-821e-b15ce5141342	f
5139da68-ccba-407f-a23e-8551400f5c1c	7ba45907-eb11-491c-97aa-dee8366525e8	t
5139da68-ccba-407f-a23e-8551400f5c1c	51faf3ac-5cc1-4c08-a419-6d4abd222139	t
5139da68-ccba-407f-a23e-8551400f5c1c	9951b853-760d-43f0-b7dc-2d20d382c9d6	f
\.


-- ============================================================================
-- Data for table: client
-- ============================================================================

COPY public.client (id, enabled, full_scope_allowed, client_id, not_before, public_client, secret, base_url, bearer_only, management_url, surrogate_auth_required, realm_id, protocol, node_rereg_timeout, frontchannel_logout, consent_required, name, service_accounts_enabled, client_authenticator_type, root_url, description, registration_token, standard_flow_enabled, implicit_flow_enabled, direct_access_grants_enabled, always_display_in_console) FROM stdin;
5b648c89-4b90-4c9a-a8e1-c0b0cb1bab07	t	f	master-realm	0	f	\N	\N	t	\N	f	6325ed20-8593-447d-95ca-17e4271cc794	\N	0	f	f	master Realm	f	client-secret	\N	\N	\N	t	f	f	f
7d53ac70-9b08-4170-bcd4-6b7def6ae2c9	t	f	account	0	t	\N	/realms/master/account/	f	\N	f	6325ed20-8593-447d-95ca-17e4271cc794	openid-connect	0	f	f	${client_account}	f	client-secret	${authBaseUrl}	\N	\N	t	f	f	f
3c877b4b-089e-425c-bc98-55fd6cbd88f3	t	f	account-console	0	t	\N	/realms/master/account/	f	\N	f	6325ed20-8593-447d-95ca-17e4271cc794	openid-connect	0	f	f	${client_account-console}	f	client-secret	${authBaseUrl}	\N	\N	t	f	f	f
af70a474-c808-47ee-a0ca-fe4a1a46ad0c	t	f	broker	0	f	\N	\N	t	\N	f	6325ed20-8593-447d-95ca-17e4271cc794	openid-connect	0	f	f	${client_broker}	f	client-secret	\N	\N	\N	t	f	f	f
15c485c5-7c14-4300-a8e1-45ce949e1066	t	t	security-admin-console	0	t	\N	/admin/master/console/	f	\N	f	6325ed20-8593-447d-95ca-17e4271cc794	openid-connect	0	f	f	${client_security-admin-console}	f	client-secret	${authAdminUrl}	\N	\N	t	f	f	f
9cda8a8c-dbd9-4f72-94a7-9c0ee30716c8	t	t	admin-cli	0	t	\N	\N	f	\N	f	6325ed20-8593-447d-95ca-17e4271cc794	openid-connect	0	f	f	${client_admin-cli}	f	client-secret	\N	\N	\N	f	f	t	f
4f9f9d93-ba74-424f-a11d-77d3b77c1ac2	t	f	athyper-realm	0	f	\N	\N	t	\N	f	6325ed20-8593-447d-95ca-17e4271cc794	\N	0	f	f	athyper Realm	f	client-secret	\N	\N	\N	t	f	f	f
b254af12-29b6-4aed-9ec5-e3566df2db39	t	f	realm-management	0	f	\N	\N	t	\N	f	5139da68-ccba-407f-a23e-8551400f5c1c	openid-connect	0	f	f	${client_realm-management}	f	client-secret	\N	\N	\N	t	f	f	f
f2cfddbb-a923-4fa9-bbda-86a713009f39	t	f	account	0	t	\N	/realms/athyper/account/	f	\N	f	5139da68-ccba-407f-a23e-8551400f5c1c	openid-connect	0	f	f	${client_account}	f	client-secret	${authBaseUrl}	\N	\N	t	f	f	f
4bc52108-2362-481d-a9ca-fc26890b178a	t	f	account-console	0	t	\N	/realms/athyper/account/	f	\N	f	5139da68-ccba-407f-a23e-8551400f5c1c	openid-connect	0	f	f	${client_account-console}	f	client-secret	${authBaseUrl}	\N	\N	t	f	f	f
0739b786-0e6e-41f6-9be5-1b0125f159ce	t	f	broker	0	f	\N	\N	t	\N	f	5139da68-ccba-407f-a23e-8551400f5c1c	openid-connect	0	f	f	${client_broker}	f	client-secret	\N	\N	\N	t	f	f	f
b36a333b-baf0-48aa-b15d-2a263e9085c0	t	t	security-admin-console	0	t	\N	/admin/athyper/console/	f	\N	f	5139da68-ccba-407f-a23e-8551400f5c1c	openid-connect	0	f	f	${client_security-admin-console}	f	client-secret	${authAdminUrl}	\N	\N	t	f	f	f
05b62f44-929d-4c6a-b121-590565b27141	t	t	admin-cli	0	t	\N	\N	f	\N	f	5139da68-ccba-407f-a23e-8551400f5c1c	openid-connect	0	f	f	${client_admin-cli}	f	client-secret	\N	\N	\N	f	f	t	f
fd2341e8-7fdc-42c3-a269-2551e82397d2	t	t	neon-web	0	t	\N		f		f	5139da68-ccba-407f-a23e-8551400f5c1c	openid-connect	-1	t	t	Neon ERP	f	client-secret		Neon ERP	\N	t	f	f	f
\.


-- ============================================================================
-- Data for table: client_attributes
-- ============================================================================

COPY public.client_attributes (client_id, name, value) FROM stdin;
7d53ac70-9b08-4170-bcd4-6b7def6ae2c9	post.logout.redirect.uris	+
3c877b4b-089e-425c-bc98-55fd6cbd88f3	post.logout.redirect.uris	+
3c877b4b-089e-425c-bc98-55fd6cbd88f3	pkce.code.challenge.method	S256
15c485c5-7c14-4300-a8e1-45ce949e1066	post.logout.redirect.uris	+
15c485c5-7c14-4300-a8e1-45ce949e1066	pkce.code.challenge.method	S256
15c485c5-7c14-4300-a8e1-45ce949e1066	client.use.lightweight.access.token.enabled	true
9cda8a8c-dbd9-4f72-94a7-9c0ee30716c8	client.use.lightweight.access.token.enabled	true
f2cfddbb-a923-4fa9-bbda-86a713009f39	post.logout.redirect.uris	+
4bc52108-2362-481d-a9ca-fc26890b178a	post.logout.redirect.uris	+
4bc52108-2362-481d-a9ca-fc26890b178a	pkce.code.challenge.method	S256
b36a333b-baf0-48aa-b15d-2a263e9085c0	post.logout.redirect.uris	+
b36a333b-baf0-48aa-b15d-2a263e9085c0	pkce.code.challenge.method	S256
b36a333b-baf0-48aa-b15d-2a263e9085c0	client.use.lightweight.access.token.enabled	true
05b62f44-929d-4c6a-b121-590565b27141	client.use.lightweight.access.token.enabled	true
fd2341e8-7fdc-42c3-a269-2551e82397d2	standard.token.exchange.enabled	false
fd2341e8-7fdc-42c3-a269-2551e82397d2	oauth2.device.authorization.grant.enabled	false
fd2341e8-7fdc-42c3-a269-2551e82397d2	oidc.ciba.grant.enabled	false
fd2341e8-7fdc-42c3-a269-2551e82397d2	dpop.bound.access.tokens	false
fd2341e8-7fdc-42c3-a269-2551e82397d2	post.logout.redirect.uris	http://localhost:3001/*
fd2341e8-7fdc-42c3-a269-2551e82397d2	backchannel.logout.session.required	true
fd2341e8-7fdc-42c3-a269-2551e82397d2	backchannel.logout.revoke.offline.tokens	false
fd2341e8-7fdc-42c3-a269-2551e82397d2	realm_client	false
fd2341e8-7fdc-42c3-a269-2551e82397d2	display.on.consent.screen	true
fd2341e8-7fdc-42c3-a269-2551e82397d2	consent.screen.text	Login Terms to use Neon
fd2341e8-7fdc-42c3-a269-2551e82397d2	frontchannel.logout.session.required	true
fd2341e8-7fdc-42c3-a269-2551e82397d2	logout.confirmation.enabled	false
fd2341e8-7fdc-42c3-a269-2551e82397d2	access.token.header.type.rfc9068	false
fd2341e8-7fdc-42c3-a269-2551e82397d2	id.token.as.detached.signature	false
fd2341e8-7fdc-42c3-a269-2551e82397d2	request.object.required	not required
fd2341e8-7fdc-42c3-a269-2551e82397d2	use.refresh.tokens	true
fd2341e8-7fdc-42c3-a269-2551e82397d2	client_credentials.use_refresh_token	false
fd2341e8-7fdc-42c3-a269-2551e82397d2	token.response.type.bearer.lower-case	false
fd2341e8-7fdc-42c3-a269-2551e82397d2	tls.client.certificate.bound.access.tokens	false
fd2341e8-7fdc-42c3-a269-2551e82397d2	require.pushed.authorization.requests	false
fd2341e8-7fdc-42c3-a269-2551e82397d2	client.use.lightweight.access.token.enabled	false
fd2341e8-7fdc-42c3-a269-2551e82397d2	client.introspection.response.allow.jwt.claim.enabled	false
fd2341e8-7fdc-42c3-a269-2551e82397d2	acr.loa.map	{}
\.


-- ============================================================================
-- Data for table: client_auth_flow_bindings
-- ============================================================================

COPY public.client_auth_flow_bindings (client_id, flow_id, binding_name) FROM stdin;
\.


-- ============================================================================
-- Data for table: redirect_uris
-- ============================================================================

COPY public.redirect_uris (client_id, value) FROM stdin;
7d53ac70-9b08-4170-bcd4-6b7def6ae2c9	/realms/master/account/*
3c877b4b-089e-425c-bc98-55fd6cbd88f3	/realms/master/account/*
15c485c5-7c14-4300-a8e1-45ce949e1066	/admin/master/console/*
f2cfddbb-a923-4fa9-bbda-86a713009f39	/realms/athyper/account/*
4bc52108-2362-481d-a9ca-fc26890b178a	/realms/athyper/account/*
b36a333b-baf0-48aa-b15d-2a263e9085c0	/admin/athyper/console/*
fd2341e8-7fdc-42c3-a269-2551e82397d2	
fd2341e8-7fdc-42c3-a269-2551e82397d2	http://localhost:3000/*
fd2341e8-7fdc-42c3-a269-2551e82397d2	https://neon.athyper.local/*
fd2341e8-7fdc-42c3-a269-2551e82397d2	http://localhost:3001/*
\.


-- ============================================================================
-- Data for table: web_origins
-- ============================================================================

COPY public.web_origins (client_id, value) FROM stdin;
15c485c5-7c14-4300-a8e1-45ce949e1066	+
b36a333b-baf0-48aa-b15d-2a263e9085c0	+
fd2341e8-7fdc-42c3-a269-2551e82397d2	https://neon.athyper.local
fd2341e8-7fdc-42c3-a269-2551e82397d2	http://localhost:3001
fd2341e8-7fdc-42c3-a269-2551e82397d2	http://localhost:3000
\.


-- ============================================================================
-- Data for table: client_scope_client
-- ============================================================================

COPY public.client_scope_client (client_id, scope_id, default_scope) FROM stdin;
7d53ac70-9b08-4170-bcd4-6b7def6ae2c9	4a7c11b1-c523-4108-a4ee-c1ffc4583e70	t
7d53ac70-9b08-4170-bcd4-6b7def6ae2c9	77ae95dd-ba17-43a3-b946-fde1c76fbfd7	t
7d53ac70-9b08-4170-bcd4-6b7def6ae2c9	a57da4d7-c70d-4013-8249-1708182e7fc4	t
7d53ac70-9b08-4170-bcd4-6b7def6ae2c9	f95ebb75-3d04-4b6a-aff6-b102d958c617	t
7d53ac70-9b08-4170-bcd4-6b7def6ae2c9	6eff8a14-65f5-4f6f-8e6f-ac023722bcbd	t
7d53ac70-9b08-4170-bcd4-6b7def6ae2c9	b173ffe5-760d-43e6-8aaa-4ec549088e12	t
7d53ac70-9b08-4170-bcd4-6b7def6ae2c9	09da4011-b8ad-4180-820c-5c38ee856d10	f
7d53ac70-9b08-4170-bcd4-6b7def6ae2c9	089d4ac1-e772-4c0f-8468-a988187eb2f8	f
7d53ac70-9b08-4170-bcd4-6b7def6ae2c9	22f363a8-20cb-4ff7-9978-c0b85c15b032	f
7d53ac70-9b08-4170-bcd4-6b7def6ae2c9	2297ec95-fb7e-44dd-ab7a-d01af16bff7e	f
7d53ac70-9b08-4170-bcd4-6b7def6ae2c9	537cf519-d0ac-4adc-b2cd-68c7668814dc	f
3c877b4b-089e-425c-bc98-55fd6cbd88f3	4a7c11b1-c523-4108-a4ee-c1ffc4583e70	t
3c877b4b-089e-425c-bc98-55fd6cbd88f3	77ae95dd-ba17-43a3-b946-fde1c76fbfd7	t
3c877b4b-089e-425c-bc98-55fd6cbd88f3	a57da4d7-c70d-4013-8249-1708182e7fc4	t
3c877b4b-089e-425c-bc98-55fd6cbd88f3	f95ebb75-3d04-4b6a-aff6-b102d958c617	t
3c877b4b-089e-425c-bc98-55fd6cbd88f3	6eff8a14-65f5-4f6f-8e6f-ac023722bcbd	t
3c877b4b-089e-425c-bc98-55fd6cbd88f3	b173ffe5-760d-43e6-8aaa-4ec549088e12	t
3c877b4b-089e-425c-bc98-55fd6cbd88f3	09da4011-b8ad-4180-820c-5c38ee856d10	f
3c877b4b-089e-425c-bc98-55fd6cbd88f3	089d4ac1-e772-4c0f-8468-a988187eb2f8	f
3c877b4b-089e-425c-bc98-55fd6cbd88f3	22f363a8-20cb-4ff7-9978-c0b85c15b032	f
3c877b4b-089e-425c-bc98-55fd6cbd88f3	2297ec95-fb7e-44dd-ab7a-d01af16bff7e	f
3c877b4b-089e-425c-bc98-55fd6cbd88f3	537cf519-d0ac-4adc-b2cd-68c7668814dc	f
9cda8a8c-dbd9-4f72-94a7-9c0ee30716c8	4a7c11b1-c523-4108-a4ee-c1ffc4583e70	t
9cda8a8c-dbd9-4f72-94a7-9c0ee30716c8	77ae95dd-ba17-43a3-b946-fde1c76fbfd7	t
9cda8a8c-dbd9-4f72-94a7-9c0ee30716c8	a57da4d7-c70d-4013-8249-1708182e7fc4	t
9cda8a8c-dbd9-4f72-94a7-9c0ee30716c8	f95ebb75-3d04-4b6a-aff6-b102d958c617	t
9cda8a8c-dbd9-4f72-94a7-9c0ee30716c8	6eff8a14-65f5-4f6f-8e6f-ac023722bcbd	t
9cda8a8c-dbd9-4f72-94a7-9c0ee30716c8	b173ffe5-760d-43e6-8aaa-4ec549088e12	t
9cda8a8c-dbd9-4f72-94a7-9c0ee30716c8	09da4011-b8ad-4180-820c-5c38ee856d10	f
9cda8a8c-dbd9-4f72-94a7-9c0ee30716c8	089d4ac1-e772-4c0f-8468-a988187eb2f8	f
9cda8a8c-dbd9-4f72-94a7-9c0ee30716c8	22f363a8-20cb-4ff7-9978-c0b85c15b032	f
9cda8a8c-dbd9-4f72-94a7-9c0ee30716c8	2297ec95-fb7e-44dd-ab7a-d01af16bff7e	f
9cda8a8c-dbd9-4f72-94a7-9c0ee30716c8	537cf519-d0ac-4adc-b2cd-68c7668814dc	f
af70a474-c808-47ee-a0ca-fe4a1a46ad0c	4a7c11b1-c523-4108-a4ee-c1ffc4583e70	t
af70a474-c808-47ee-a0ca-fe4a1a46ad0c	77ae95dd-ba17-43a3-b946-fde1c76fbfd7	t
af70a474-c808-47ee-a0ca-fe4a1a46ad0c	a57da4d7-c70d-4013-8249-1708182e7fc4	t
af70a474-c808-47ee-a0ca-fe4a1a46ad0c	f95ebb75-3d04-4b6a-aff6-b102d958c617	t
af70a474-c808-47ee-a0ca-fe4a1a46ad0c	6eff8a14-65f5-4f6f-8e6f-ac023722bcbd	t
af70a474-c808-47ee-a0ca-fe4a1a46ad0c	b173ffe5-760d-43e6-8aaa-4ec549088e12	t
af70a474-c808-47ee-a0ca-fe4a1a46ad0c	09da4011-b8ad-4180-820c-5c38ee856d10	f
af70a474-c808-47ee-a0ca-fe4a1a46ad0c	089d4ac1-e772-4c0f-8468-a988187eb2f8	f
af70a474-c808-47ee-a0ca-fe4a1a46ad0c	22f363a8-20cb-4ff7-9978-c0b85c15b032	f
af70a474-c808-47ee-a0ca-fe4a1a46ad0c	2297ec95-fb7e-44dd-ab7a-d01af16bff7e	f
af70a474-c808-47ee-a0ca-fe4a1a46ad0c	537cf519-d0ac-4adc-b2cd-68c7668814dc	f
5b648c89-4b90-4c9a-a8e1-c0b0cb1bab07	4a7c11b1-c523-4108-a4ee-c1ffc4583e70	t
5b648c89-4b90-4c9a-a8e1-c0b0cb1bab07	77ae95dd-ba17-43a3-b946-fde1c76fbfd7	t
5b648c89-4b90-4c9a-a8e1-c0b0cb1bab07	a57da4d7-c70d-4013-8249-1708182e7fc4	t
5b648c89-4b90-4c9a-a8e1-c0b0cb1bab07	f95ebb75-3d04-4b6a-aff6-b102d958c617	t
5b648c89-4b90-4c9a-a8e1-c0b0cb1bab07	6eff8a14-65f5-4f6f-8e6f-ac023722bcbd	t
5b648c89-4b90-4c9a-a8e1-c0b0cb1bab07	b173ffe5-760d-43e6-8aaa-4ec549088e12	t
5b648c89-4b90-4c9a-a8e1-c0b0cb1bab07	09da4011-b8ad-4180-820c-5c38ee856d10	f
5b648c89-4b90-4c9a-a8e1-c0b0cb1bab07	089d4ac1-e772-4c0f-8468-a988187eb2f8	f
5b648c89-4b90-4c9a-a8e1-c0b0cb1bab07	22f363a8-20cb-4ff7-9978-c0b85c15b032	f
5b648c89-4b90-4c9a-a8e1-c0b0cb1bab07	2297ec95-fb7e-44dd-ab7a-d01af16bff7e	f
5b648c89-4b90-4c9a-a8e1-c0b0cb1bab07	537cf519-d0ac-4adc-b2cd-68c7668814dc	f
15c485c5-7c14-4300-a8e1-45ce949e1066	4a7c11b1-c523-4108-a4ee-c1ffc4583e70	t
15c485c5-7c14-4300-a8e1-45ce949e1066	77ae95dd-ba17-43a3-b946-fde1c76fbfd7	t
15c485c5-7c14-4300-a8e1-45ce949e1066	a57da4d7-c70d-4013-8249-1708182e7fc4	t
15c485c5-7c14-4300-a8e1-45ce949e1066	f95ebb75-3d04-4b6a-aff6-b102d958c617	t
15c485c5-7c14-4300-a8e1-45ce949e1066	6eff8a14-65f5-4f6f-8e6f-ac023722bcbd	t
15c485c5-7c14-4300-a8e1-45ce949e1066	b173ffe5-760d-43e6-8aaa-4ec549088e12	t
15c485c5-7c14-4300-a8e1-45ce949e1066	09da4011-b8ad-4180-820c-5c38ee856d10	f
15c485c5-7c14-4300-a8e1-45ce949e1066	089d4ac1-e772-4c0f-8468-a988187eb2f8	f
15c485c5-7c14-4300-a8e1-45ce949e1066	22f363a8-20cb-4ff7-9978-c0b85c15b032	f
15c485c5-7c14-4300-a8e1-45ce949e1066	2297ec95-fb7e-44dd-ab7a-d01af16bff7e	f
15c485c5-7c14-4300-a8e1-45ce949e1066	537cf519-d0ac-4adc-b2cd-68c7668814dc	f
f2cfddbb-a923-4fa9-bbda-86a713009f39	51faf3ac-5cc1-4c08-a419-6d4abd222139	t
f2cfddbb-a923-4fa9-bbda-86a713009f39	7ba45907-eb11-491c-97aa-dee8366525e8	t
f2cfddbb-a923-4fa9-bbda-86a713009f39	ffd53e84-6a72-477d-808e-33af9e9b62c8	t
f2cfddbb-a923-4fa9-bbda-86a713009f39	7c2e690d-4dbe-4db5-95f7-a442ef604491	t
f2cfddbb-a923-4fa9-bbda-86a713009f39	bcd37f59-ed5c-40c9-b652-949cbf49400a	t
f2cfddbb-a923-4fa9-bbda-86a713009f39	8582706b-beb9-4d3e-b344-51d74607e667	t
f2cfddbb-a923-4fa9-bbda-86a713009f39	9951b853-760d-43f0-b7dc-2d20d382c9d6	f
f2cfddbb-a923-4fa9-bbda-86a713009f39	b751d23f-d322-44b9-821e-b15ce5141342	f
f2cfddbb-a923-4fa9-bbda-86a713009f39	a2c00dbd-7f83-49af-a9eb-f79955833828	f
f2cfddbb-a923-4fa9-bbda-86a713009f39	14976545-421c-43b3-bb3f-b293afc9c547	f
f2cfddbb-a923-4fa9-bbda-86a713009f39	ca6bb65b-d7f7-4b12-8556-71ce24281f5b	f
4bc52108-2362-481d-a9ca-fc26890b178a	51faf3ac-5cc1-4c08-a419-6d4abd222139	t
4bc52108-2362-481d-a9ca-fc26890b178a	7ba45907-eb11-491c-97aa-dee8366525e8	t
4bc52108-2362-481d-a9ca-fc26890b178a	ffd53e84-6a72-477d-808e-33af9e9b62c8	t
4bc52108-2362-481d-a9ca-fc26890b178a	7c2e690d-4dbe-4db5-95f7-a442ef604491	t
4bc52108-2362-481d-a9ca-fc26890b178a	bcd37f59-ed5c-40c9-b652-949cbf49400a	t
4bc52108-2362-481d-a9ca-fc26890b178a	8582706b-beb9-4d3e-b344-51d74607e667	t
4bc52108-2362-481d-a9ca-fc26890b178a	9951b853-760d-43f0-b7dc-2d20d382c9d6	f
4bc52108-2362-481d-a9ca-fc26890b178a	b751d23f-d322-44b9-821e-b15ce5141342	f
4bc52108-2362-481d-a9ca-fc26890b178a	a2c00dbd-7f83-49af-a9eb-f79955833828	f
4bc52108-2362-481d-a9ca-fc26890b178a	14976545-421c-43b3-bb3f-b293afc9c547	f
4bc52108-2362-481d-a9ca-fc26890b178a	ca6bb65b-d7f7-4b12-8556-71ce24281f5b	f
05b62f44-929d-4c6a-b121-590565b27141	51faf3ac-5cc1-4c08-a419-6d4abd222139	t
05b62f44-929d-4c6a-b121-590565b27141	7ba45907-eb11-491c-97aa-dee8366525e8	t
05b62f44-929d-4c6a-b121-590565b27141	ffd53e84-6a72-477d-808e-33af9e9b62c8	t
05b62f44-929d-4c6a-b121-590565b27141	7c2e690d-4dbe-4db5-95f7-a442ef604491	t
05b62f44-929d-4c6a-b121-590565b27141	bcd37f59-ed5c-40c9-b652-949cbf49400a	t
05b62f44-929d-4c6a-b121-590565b27141	8582706b-beb9-4d3e-b344-51d74607e667	t
05b62f44-929d-4c6a-b121-590565b27141	9951b853-760d-43f0-b7dc-2d20d382c9d6	f
05b62f44-929d-4c6a-b121-590565b27141	b751d23f-d322-44b9-821e-b15ce5141342	f
05b62f44-929d-4c6a-b121-590565b27141	a2c00dbd-7f83-49af-a9eb-f79955833828	f
05b62f44-929d-4c6a-b121-590565b27141	14976545-421c-43b3-bb3f-b293afc9c547	f
05b62f44-929d-4c6a-b121-590565b27141	ca6bb65b-d7f7-4b12-8556-71ce24281f5b	f
0739b786-0e6e-41f6-9be5-1b0125f159ce	51faf3ac-5cc1-4c08-a419-6d4abd222139	t
0739b786-0e6e-41f6-9be5-1b0125f159ce	7ba45907-eb11-491c-97aa-dee8366525e8	t
0739b786-0e6e-41f6-9be5-1b0125f159ce	ffd53e84-6a72-477d-808e-33af9e9b62c8	t
0739b786-0e6e-41f6-9be5-1b0125f159ce	7c2e690d-4dbe-4db5-95f7-a442ef604491	t
0739b786-0e6e-41f6-9be5-1b0125f159ce	bcd37f59-ed5c-40c9-b652-949cbf49400a	t
0739b786-0e6e-41f6-9be5-1b0125f159ce	8582706b-beb9-4d3e-b344-51d74607e667	t
0739b786-0e6e-41f6-9be5-1b0125f159ce	9951b853-760d-43f0-b7dc-2d20d382c9d6	f
0739b786-0e6e-41f6-9be5-1b0125f159ce	b751d23f-d322-44b9-821e-b15ce5141342	f
0739b786-0e6e-41f6-9be5-1b0125f159ce	a2c00dbd-7f83-49af-a9eb-f79955833828	f
0739b786-0e6e-41f6-9be5-1b0125f159ce	14976545-421c-43b3-bb3f-b293afc9c547	f
0739b786-0e6e-41f6-9be5-1b0125f159ce	ca6bb65b-d7f7-4b12-8556-71ce24281f5b	f
b254af12-29b6-4aed-9ec5-e3566df2db39	51faf3ac-5cc1-4c08-a419-6d4abd222139	t
b254af12-29b6-4aed-9ec5-e3566df2db39	7ba45907-eb11-491c-97aa-dee8366525e8	t
b254af12-29b6-4aed-9ec5-e3566df2db39	ffd53e84-6a72-477d-808e-33af9e9b62c8	t
b254af12-29b6-4aed-9ec5-e3566df2db39	7c2e690d-4dbe-4db5-95f7-a442ef604491	t
b254af12-29b6-4aed-9ec5-e3566df2db39	bcd37f59-ed5c-40c9-b652-949cbf49400a	t
b254af12-29b6-4aed-9ec5-e3566df2db39	8582706b-beb9-4d3e-b344-51d74607e667	t
b254af12-29b6-4aed-9ec5-e3566df2db39	9951b853-760d-43f0-b7dc-2d20d382c9d6	f
b254af12-29b6-4aed-9ec5-e3566df2db39	b751d23f-d322-44b9-821e-b15ce5141342	f
b254af12-29b6-4aed-9ec5-e3566df2db39	a2c00dbd-7f83-49af-a9eb-f79955833828	f
b254af12-29b6-4aed-9ec5-e3566df2db39	14976545-421c-43b3-bb3f-b293afc9c547	f
b254af12-29b6-4aed-9ec5-e3566df2db39	ca6bb65b-d7f7-4b12-8556-71ce24281f5b	f
b36a333b-baf0-48aa-b15d-2a263e9085c0	51faf3ac-5cc1-4c08-a419-6d4abd222139	t
b36a333b-baf0-48aa-b15d-2a263e9085c0	7ba45907-eb11-491c-97aa-dee8366525e8	t
b36a333b-baf0-48aa-b15d-2a263e9085c0	ffd53e84-6a72-477d-808e-33af9e9b62c8	t
b36a333b-baf0-48aa-b15d-2a263e9085c0	7c2e690d-4dbe-4db5-95f7-a442ef604491	t
b36a333b-baf0-48aa-b15d-2a263e9085c0	bcd37f59-ed5c-40c9-b652-949cbf49400a	t
b36a333b-baf0-48aa-b15d-2a263e9085c0	8582706b-beb9-4d3e-b344-51d74607e667	t
b36a333b-baf0-48aa-b15d-2a263e9085c0	9951b853-760d-43f0-b7dc-2d20d382c9d6	f
b36a333b-baf0-48aa-b15d-2a263e9085c0	b751d23f-d322-44b9-821e-b15ce5141342	f
b36a333b-baf0-48aa-b15d-2a263e9085c0	a2c00dbd-7f83-49af-a9eb-f79955833828	f
b36a333b-baf0-48aa-b15d-2a263e9085c0	14976545-421c-43b3-bb3f-b293afc9c547	f
b36a333b-baf0-48aa-b15d-2a263e9085c0	ca6bb65b-d7f7-4b12-8556-71ce24281f5b	f
fd2341e8-7fdc-42c3-a269-2551e82397d2	51faf3ac-5cc1-4c08-a419-6d4abd222139	t
fd2341e8-7fdc-42c3-a269-2551e82397d2	7ba45907-eb11-491c-97aa-dee8366525e8	t
fd2341e8-7fdc-42c3-a269-2551e82397d2	ffd53e84-6a72-477d-808e-33af9e9b62c8	t
fd2341e8-7fdc-42c3-a269-2551e82397d2	7c2e690d-4dbe-4db5-95f7-a442ef604491	t
fd2341e8-7fdc-42c3-a269-2551e82397d2	bcd37f59-ed5c-40c9-b652-949cbf49400a	t
fd2341e8-7fdc-42c3-a269-2551e82397d2	8582706b-beb9-4d3e-b344-51d74607e667	t
fd2341e8-7fdc-42c3-a269-2551e82397d2	9951b853-760d-43f0-b7dc-2d20d382c9d6	f
fd2341e8-7fdc-42c3-a269-2551e82397d2	b751d23f-d322-44b9-821e-b15ce5141342	f
fd2341e8-7fdc-42c3-a269-2551e82397d2	a2c00dbd-7f83-49af-a9eb-f79955833828	f
fd2341e8-7fdc-42c3-a269-2551e82397d2	14976545-421c-43b3-bb3f-b293afc9c547	f
fd2341e8-7fdc-42c3-a269-2551e82397d2	ca6bb65b-d7f7-4b12-8556-71ce24281f5b	f
\.


-- ============================================================================
-- Data for table: client_scope_role_mapping
-- ============================================================================

COPY public.client_scope_role_mapping (scope_id, role_id) FROM stdin;
09da4011-b8ad-4180-820c-5c38ee856d10	3a3cdef0-b749-4e9c-9fcd-3af8e68bfe3f
14976545-421c-43b3-bb3f-b293afc9c547	b00ded14-41db-4c54-a991-ea270653b494
\.


-- ============================================================================
-- Data for table: protocol_mapper
-- ============================================================================

COPY public.protocol_mapper (id, name, protocol, protocol_mapper_name, client_id, client_scope_id) FROM stdin;
fe860161-a4d3-44f1-b7ba-f3fc3ab33f6a	audience resolve	openid-connect	oidc-audience-resolve-mapper	3c877b4b-089e-425c-bc98-55fd6cbd88f3	\N
5efa9da3-34e6-4976-a71a-8c4948fff37d	locale	openid-connect	oidc-usermodel-attribute-mapper	15c485c5-7c14-4300-a8e1-45ce949e1066	\N
3d510168-dac6-4114-be4d-4d9359ab9a09	role list	saml	saml-role-list-mapper	\N	f66c2fea-eca9-4232-9e8c-767c20c9f14d
78c62e60-490a-49ea-bc84-fe2b884e872c	organization	saml	saml-organization-membership-mapper	\N	fe9b7ea7-dd1b-4a89-9399-da1c73f16821
3351cfcd-8aae-41c8-b5fd-fbe01794e6eb	full name	openid-connect	oidc-full-name-mapper	\N	f95ebb75-3d04-4b6a-aff6-b102d958c617
7f193001-9a77-4a1c-af08-ab7d5751a3cd	family name	openid-connect	oidc-usermodel-attribute-mapper	\N	f95ebb75-3d04-4b6a-aff6-b102d958c617
5f951488-2b03-4eeb-baf0-b267256ff990	given name	openid-connect	oidc-usermodel-attribute-mapper	\N	f95ebb75-3d04-4b6a-aff6-b102d958c617
89efc4ac-b10c-4700-a246-e4ca6a8cc379	middle name	openid-connect	oidc-usermodel-attribute-mapper	\N	f95ebb75-3d04-4b6a-aff6-b102d958c617
7c79481d-706e-4cc0-bef6-ed7e66c6dd96	nickname	openid-connect	oidc-usermodel-attribute-mapper	\N	f95ebb75-3d04-4b6a-aff6-b102d958c617
4e7a9eac-52e3-4b6b-9105-0141cfc48b01	username	openid-connect	oidc-usermodel-attribute-mapper	\N	f95ebb75-3d04-4b6a-aff6-b102d958c617
c92436bd-5084-460e-b467-59912be05275	profile	openid-connect	oidc-usermodel-attribute-mapper	\N	f95ebb75-3d04-4b6a-aff6-b102d958c617
01c659a1-b4e6-4a23-b835-6fc1a080325a	picture	openid-connect	oidc-usermodel-attribute-mapper	\N	f95ebb75-3d04-4b6a-aff6-b102d958c617
07130e94-af87-4b93-bdaf-59838389d816	website	openid-connect	oidc-usermodel-attribute-mapper	\N	f95ebb75-3d04-4b6a-aff6-b102d958c617
49b4d3d4-b5a6-4ed1-996c-a52225659c06	gender	openid-connect	oidc-usermodel-attribute-mapper	\N	f95ebb75-3d04-4b6a-aff6-b102d958c617
9729d78b-e07f-42e1-b273-b14bbcb511c0	birthdate	openid-connect	oidc-usermodel-attribute-mapper	\N	f95ebb75-3d04-4b6a-aff6-b102d958c617
b62de241-3477-4e9d-b7fe-011d0d4c980d	zoneinfo	openid-connect	oidc-usermodel-attribute-mapper	\N	f95ebb75-3d04-4b6a-aff6-b102d958c617
b46bb00f-abc8-4666-a1ab-4cc4927825e5	locale	openid-connect	oidc-usermodel-attribute-mapper	\N	f95ebb75-3d04-4b6a-aff6-b102d958c617
b9bfe3a1-c30c-4a26-9d00-d3f126084cd6	updated at	openid-connect	oidc-usermodel-attribute-mapper	\N	f95ebb75-3d04-4b6a-aff6-b102d958c617
277a568e-ed1a-4996-ab46-ec6019c6679a	email	openid-connect	oidc-usermodel-attribute-mapper	\N	77ae95dd-ba17-43a3-b946-fde1c76fbfd7
3850e3f0-e575-45ec-917c-f466fc9cddbc	email verified	openid-connect	oidc-usermodel-property-mapper	\N	77ae95dd-ba17-43a3-b946-fde1c76fbfd7
13b32888-4e6f-4559-86b3-4392f306d1a1	address	openid-connect	oidc-address-mapper	\N	22f363a8-20cb-4ff7-9978-c0b85c15b032
144c4257-2603-467b-9be1-d7b301b18bad	phone number	openid-connect	oidc-usermodel-attribute-mapper	\N	089d4ac1-e772-4c0f-8468-a988187eb2f8
63209716-64b5-405a-a97a-7e638fd89208	phone number verified	openid-connect	oidc-usermodel-attribute-mapper	\N	089d4ac1-e772-4c0f-8468-a988187eb2f8
8472df33-7903-4c09-a7bb-e17fcb9ebd60	realm roles	openid-connect	oidc-usermodel-realm-role-mapper	\N	a57da4d7-c70d-4013-8249-1708182e7fc4
68056de9-2efe-44c4-8a40-62de9d08d53c	client roles	openid-connect	oidc-usermodel-client-role-mapper	\N	a57da4d7-c70d-4013-8249-1708182e7fc4
8d5ae166-56fb-4826-b190-b640badedda7	audience resolve	openid-connect	oidc-audience-resolve-mapper	\N	a57da4d7-c70d-4013-8249-1708182e7fc4
3893d9bc-709e-47a8-9eea-5f91ee43f91a	allowed web origins	openid-connect	oidc-allowed-origins-mapper	\N	6eff8a14-65f5-4f6f-8e6f-ac023722bcbd
413d10ae-42ad-4775-b00a-4c03c8a7adec	upn	openid-connect	oidc-usermodel-attribute-mapper	\N	2297ec95-fb7e-44dd-ab7a-d01af16bff7e
c41fd0ed-5d38-4f86-a386-bfc727817ad2	groups	openid-connect	oidc-usermodel-realm-role-mapper	\N	2297ec95-fb7e-44dd-ab7a-d01af16bff7e
a4822e55-7635-4557-bd67-f9bb21ac1534	acr loa level	openid-connect	oidc-acr-mapper	\N	b173ffe5-760d-43e6-8aaa-4ec549088e12
6bf0f06f-dcd3-43f8-9739-7b8596c93629	auth_time	openid-connect	oidc-usersessionmodel-note-mapper	\N	4a7c11b1-c523-4108-a4ee-c1ffc4583e70
931dcda6-b1fd-43a5-8cf2-442588fa8449	sub	openid-connect	oidc-sub-mapper	\N	4a7c11b1-c523-4108-a4ee-c1ffc4583e70
21b21d12-d3d5-4ac9-8653-2a9dd27ab9da	Client ID	openid-connect	oidc-usersessionmodel-note-mapper	\N	c2aec92a-b876-4ef8-bf6e-6b637129fa6c
759d69a3-a2d0-4e35-86bf-d7b99545112e	Client Host	openid-connect	oidc-usersessionmodel-note-mapper	\N	c2aec92a-b876-4ef8-bf6e-6b637129fa6c
4c7008e6-a87e-4f31-9b2c-15210ea6127d	Client IP Address	openid-connect	oidc-usersessionmodel-note-mapper	\N	c2aec92a-b876-4ef8-bf6e-6b637129fa6c
11056b9a-42cd-41e8-9e07-2b6963336b86	organization	openid-connect	oidc-organization-membership-mapper	\N	537cf519-d0ac-4adc-b2cd-68c7668814dc
41115695-0742-4eaf-98fb-deb005471a7e	audience resolve	openid-connect	oidc-audience-resolve-mapper	4bc52108-2362-481d-a9ca-fc26890b178a	\N
b50109de-9bb3-4462-af6d-88212a62a036	role list	saml	saml-role-list-mapper	\N	9c01334e-cb09-4d99-b846-52eb1af860c3
6d689991-d579-48eb-a5ed-e07c5bacc33d	organization	saml	saml-organization-membership-mapper	\N	a8b3983e-86ad-44e4-8e6e-615c805f5882
271ff918-2dc1-450a-8e73-93ed62fcdf14	full name	openid-connect	oidc-full-name-mapper	\N	7c2e690d-4dbe-4db5-95f7-a442ef604491
8f9cb361-d005-4a74-ad6c-aaa97ea0046f	family name	openid-connect	oidc-usermodel-attribute-mapper	\N	7c2e690d-4dbe-4db5-95f7-a442ef604491
33fe4aac-ec2d-45a6-ac43-3fb5be52020a	given name	openid-connect	oidc-usermodel-attribute-mapper	\N	7c2e690d-4dbe-4db5-95f7-a442ef604491
a089aa00-b65c-43d8-9d90-4510b18a32c6	middle name	openid-connect	oidc-usermodel-attribute-mapper	\N	7c2e690d-4dbe-4db5-95f7-a442ef604491
d8abb9ff-39e3-4800-b823-cb17734f7d29	nickname	openid-connect	oidc-usermodel-attribute-mapper	\N	7c2e690d-4dbe-4db5-95f7-a442ef604491
47e803cc-2485-488f-b4bd-f15809d0f9bb	username	openid-connect	oidc-usermodel-attribute-mapper	\N	7c2e690d-4dbe-4db5-95f7-a442ef604491
3aeffb99-c129-4318-bd34-16c333f4d39b	profile	openid-connect	oidc-usermodel-attribute-mapper	\N	7c2e690d-4dbe-4db5-95f7-a442ef604491
7b3f46b0-99e3-4e5e-8dcc-7590df7443d6	picture	openid-connect	oidc-usermodel-attribute-mapper	\N	7c2e690d-4dbe-4db5-95f7-a442ef604491
596c2b72-075c-4333-9ca2-d1e00e3eed97	website	openid-connect	oidc-usermodel-attribute-mapper	\N	7c2e690d-4dbe-4db5-95f7-a442ef604491
f38f5698-3d29-492a-a309-e5e50dd4a8a0	gender	openid-connect	oidc-usermodel-attribute-mapper	\N	7c2e690d-4dbe-4db5-95f7-a442ef604491
858eb0b3-bf06-4ea6-9fd4-c5f07746cdcd	birthdate	openid-connect	oidc-usermodel-attribute-mapper	\N	7c2e690d-4dbe-4db5-95f7-a442ef604491
9b6078a3-3021-4594-a608-dfceff3746a5	zoneinfo	openid-connect	oidc-usermodel-attribute-mapper	\N	7c2e690d-4dbe-4db5-95f7-a442ef604491
9b8096d1-0550-421c-8e5c-0f789471e2db	locale	openid-connect	oidc-usermodel-attribute-mapper	\N	7c2e690d-4dbe-4db5-95f7-a442ef604491
a718f616-dc4e-42c1-a546-9d459ab8397a	updated at	openid-connect	oidc-usermodel-attribute-mapper	\N	7c2e690d-4dbe-4db5-95f7-a442ef604491
d72f6270-968a-4fcb-880e-206dbe9b8e7e	email	openid-connect	oidc-usermodel-attribute-mapper	\N	bcd37f59-ed5c-40c9-b652-949cbf49400a
6186104e-1e05-4036-a3cb-2e82ded0ee25	email verified	openid-connect	oidc-usermodel-property-mapper	\N	bcd37f59-ed5c-40c9-b652-949cbf49400a
199a4e5c-b9c3-48ac-b764-c1f91b45efc6	address	openid-connect	oidc-address-mapper	\N	a2c00dbd-7f83-49af-a9eb-f79955833828
1aa85dd8-f084-41fe-8192-c74c59aaa32b	phone number	openid-connect	oidc-usermodel-attribute-mapper	\N	ca6bb65b-d7f7-4b12-8556-71ce24281f5b
3a70af9a-d88d-4ccb-aaaf-aaccb42a49e2	phone number verified	openid-connect	oidc-usermodel-attribute-mapper	\N	ca6bb65b-d7f7-4b12-8556-71ce24281f5b
5d99b2c7-9f02-4b76-9d5d-f40da59a5bf6	realm roles	openid-connect	oidc-usermodel-realm-role-mapper	\N	8582706b-beb9-4d3e-b344-51d74607e667
8577c302-36f5-477e-9b78-f007c6696ecb	client roles	openid-connect	oidc-usermodel-client-role-mapper	\N	8582706b-beb9-4d3e-b344-51d74607e667
8c8694c2-1fa4-4cb7-8c80-449506c62a13	audience resolve	openid-connect	oidc-audience-resolve-mapper	\N	8582706b-beb9-4d3e-b344-51d74607e667
2b4a744f-3ccc-48f8-91fc-ad2fb2104c59	allowed web origins	openid-connect	oidc-allowed-origins-mapper	\N	ffd53e84-6a72-477d-808e-33af9e9b62c8
d1c47efa-3156-482f-98cf-26d4223d12ff	upn	openid-connect	oidc-usermodel-attribute-mapper	\N	b751d23f-d322-44b9-821e-b15ce5141342
54dbe448-eadc-4e31-9e70-c8b22a93fcc1	groups	openid-connect	oidc-usermodel-realm-role-mapper	\N	b751d23f-d322-44b9-821e-b15ce5141342
b0c08a30-0da4-498a-9311-6c8ad6ee27e5	acr loa level	openid-connect	oidc-acr-mapper	\N	7ba45907-eb11-491c-97aa-dee8366525e8
91d388c9-fd3f-4b5e-ab3d-4985193b88fe	auth_time	openid-connect	oidc-usersessionmodel-note-mapper	\N	51faf3ac-5cc1-4c08-a419-6d4abd222139
ef14e806-a175-4a2d-b734-998669c981e4	sub	openid-connect	oidc-sub-mapper	\N	51faf3ac-5cc1-4c08-a419-6d4abd222139
87c0e431-fbed-43c3-8ab8-3d31694dfcf2	Client ID	openid-connect	oidc-usersessionmodel-note-mapper	\N	852a6cf6-0f88-4599-8601-ef489f87e1f0
a4245249-5543-4511-958c-9f8b42696629	Client Host	openid-connect	oidc-usersessionmodel-note-mapper	\N	852a6cf6-0f88-4599-8601-ef489f87e1f0
58e0151b-7009-4083-b47f-abc37b807187	Client IP Address	openid-connect	oidc-usersessionmodel-note-mapper	\N	852a6cf6-0f88-4599-8601-ef489f87e1f0
31927479-69e1-40bc-8986-2791c2838ad3	organization	openid-connect	oidc-organization-membership-mapper	\N	9951b853-760d-43f0-b7dc-2d20d382c9d6
f36602c9-1f5b-424c-800b-1e527bafea6e	locale	openid-connect	oidc-usermodel-attribute-mapper	b36a333b-baf0-48aa-b15d-2a263e9085c0	\N
\.


-- ============================================================================
-- Data for table: protocol_mapper_config
-- ============================================================================

COPY public.protocol_mapper_config (protocol_mapper_id, value, name) FROM stdin;
5efa9da3-34e6-4976-a71a-8c4948fff37d	true	introspection.token.claim
5efa9da3-34e6-4976-a71a-8c4948fff37d	true	userinfo.token.claim
5efa9da3-34e6-4976-a71a-8c4948fff37d	locale	user.attribute
5efa9da3-34e6-4976-a71a-8c4948fff37d	true	id.token.claim
5efa9da3-34e6-4976-a71a-8c4948fff37d	true	access.token.claim
5efa9da3-34e6-4976-a71a-8c4948fff37d	locale	claim.name
5efa9da3-34e6-4976-a71a-8c4948fff37d	String	jsonType.label
3d510168-dac6-4114-be4d-4d9359ab9a09	false	single
3d510168-dac6-4114-be4d-4d9359ab9a09	Basic	attribute.nameformat
3d510168-dac6-4114-be4d-4d9359ab9a09	Role	attribute.name
01c659a1-b4e6-4a23-b835-6fc1a080325a	true	introspection.token.claim
01c659a1-b4e6-4a23-b835-6fc1a080325a	true	userinfo.token.claim
01c659a1-b4e6-4a23-b835-6fc1a080325a	picture	user.attribute
01c659a1-b4e6-4a23-b835-6fc1a080325a	true	id.token.claim
01c659a1-b4e6-4a23-b835-6fc1a080325a	true	access.token.claim
01c659a1-b4e6-4a23-b835-6fc1a080325a	picture	claim.name
01c659a1-b4e6-4a23-b835-6fc1a080325a	String	jsonType.label
07130e94-af87-4b93-bdaf-59838389d816	true	introspection.token.claim
07130e94-af87-4b93-bdaf-59838389d816	true	userinfo.token.claim
07130e94-af87-4b93-bdaf-59838389d816	website	user.attribute
07130e94-af87-4b93-bdaf-59838389d816	true	id.token.claim
07130e94-af87-4b93-bdaf-59838389d816	true	access.token.claim
07130e94-af87-4b93-bdaf-59838389d816	website	claim.name
07130e94-af87-4b93-bdaf-59838389d816	String	jsonType.label
3351cfcd-8aae-41c8-b5fd-fbe01794e6eb	true	introspection.token.claim
3351cfcd-8aae-41c8-b5fd-fbe01794e6eb	true	userinfo.token.claim
3351cfcd-8aae-41c8-b5fd-fbe01794e6eb	true	id.token.claim
3351cfcd-8aae-41c8-b5fd-fbe01794e6eb	true	access.token.claim
49b4d3d4-b5a6-4ed1-996c-a52225659c06	true	introspection.token.claim
49b4d3d4-b5a6-4ed1-996c-a52225659c06	true	userinfo.token.claim
49b4d3d4-b5a6-4ed1-996c-a52225659c06	gender	user.attribute
49b4d3d4-b5a6-4ed1-996c-a52225659c06	true	id.token.claim
49b4d3d4-b5a6-4ed1-996c-a52225659c06	true	access.token.claim
49b4d3d4-b5a6-4ed1-996c-a52225659c06	gender	claim.name
49b4d3d4-b5a6-4ed1-996c-a52225659c06	String	jsonType.label
4e7a9eac-52e3-4b6b-9105-0141cfc48b01	true	introspection.token.claim
4e7a9eac-52e3-4b6b-9105-0141cfc48b01	true	userinfo.token.claim
4e7a9eac-52e3-4b6b-9105-0141cfc48b01	username	user.attribute
4e7a9eac-52e3-4b6b-9105-0141cfc48b01	true	id.token.claim
4e7a9eac-52e3-4b6b-9105-0141cfc48b01	true	access.token.claim
4e7a9eac-52e3-4b6b-9105-0141cfc48b01	preferred_username	claim.name
4e7a9eac-52e3-4b6b-9105-0141cfc48b01	String	jsonType.label
5f951488-2b03-4eeb-baf0-b267256ff990	true	introspection.token.claim
5f951488-2b03-4eeb-baf0-b267256ff990	true	userinfo.token.claim
5f951488-2b03-4eeb-baf0-b267256ff990	firstName	user.attribute
5f951488-2b03-4eeb-baf0-b267256ff990	true	id.token.claim
5f951488-2b03-4eeb-baf0-b267256ff990	true	access.token.claim
5f951488-2b03-4eeb-baf0-b267256ff990	given_name	claim.name
5f951488-2b03-4eeb-baf0-b267256ff990	String	jsonType.label
7c79481d-706e-4cc0-bef6-ed7e66c6dd96	true	introspection.token.claim
7c79481d-706e-4cc0-bef6-ed7e66c6dd96	true	userinfo.token.claim
7c79481d-706e-4cc0-bef6-ed7e66c6dd96	nickname	user.attribute
7c79481d-706e-4cc0-bef6-ed7e66c6dd96	true	id.token.claim
7c79481d-706e-4cc0-bef6-ed7e66c6dd96	true	access.token.claim
7c79481d-706e-4cc0-bef6-ed7e66c6dd96	nickname	claim.name
7c79481d-706e-4cc0-bef6-ed7e66c6dd96	String	jsonType.label
7f193001-9a77-4a1c-af08-ab7d5751a3cd	true	introspection.token.claim
7f193001-9a77-4a1c-af08-ab7d5751a3cd	true	userinfo.token.claim
7f193001-9a77-4a1c-af08-ab7d5751a3cd	lastName	user.attribute
7f193001-9a77-4a1c-af08-ab7d5751a3cd	true	id.token.claim
7f193001-9a77-4a1c-af08-ab7d5751a3cd	true	access.token.claim
7f193001-9a77-4a1c-af08-ab7d5751a3cd	family_name	claim.name
7f193001-9a77-4a1c-af08-ab7d5751a3cd	String	jsonType.label
89efc4ac-b10c-4700-a246-e4ca6a8cc379	true	introspection.token.claim
89efc4ac-b10c-4700-a246-e4ca6a8cc379	true	userinfo.token.claim
89efc4ac-b10c-4700-a246-e4ca6a8cc379	middleName	user.attribute
89efc4ac-b10c-4700-a246-e4ca6a8cc379	true	id.token.claim
89efc4ac-b10c-4700-a246-e4ca6a8cc379	true	access.token.claim
89efc4ac-b10c-4700-a246-e4ca6a8cc379	middle_name	claim.name
89efc4ac-b10c-4700-a246-e4ca6a8cc379	String	jsonType.label
9729d78b-e07f-42e1-b273-b14bbcb511c0	true	introspection.token.claim
9729d78b-e07f-42e1-b273-b14bbcb511c0	true	userinfo.token.claim
9729d78b-e07f-42e1-b273-b14bbcb511c0	birthdate	user.attribute
9729d78b-e07f-42e1-b273-b14bbcb511c0	true	id.token.claim
9729d78b-e07f-42e1-b273-b14bbcb511c0	true	access.token.claim
9729d78b-e07f-42e1-b273-b14bbcb511c0	birthdate	claim.name
9729d78b-e07f-42e1-b273-b14bbcb511c0	String	jsonType.label
b46bb00f-abc8-4666-a1ab-4cc4927825e5	true	introspection.token.claim
b46bb00f-abc8-4666-a1ab-4cc4927825e5	true	userinfo.token.claim
b46bb00f-abc8-4666-a1ab-4cc4927825e5	locale	user.attribute
b46bb00f-abc8-4666-a1ab-4cc4927825e5	true	id.token.claim
b46bb00f-abc8-4666-a1ab-4cc4927825e5	true	access.token.claim
b46bb00f-abc8-4666-a1ab-4cc4927825e5	locale	claim.name
b46bb00f-abc8-4666-a1ab-4cc4927825e5	String	jsonType.label
b62de241-3477-4e9d-b7fe-011d0d4c980d	true	introspection.token.claim
b62de241-3477-4e9d-b7fe-011d0d4c980d	true	userinfo.token.claim
b62de241-3477-4e9d-b7fe-011d0d4c980d	zoneinfo	user.attribute
b62de241-3477-4e9d-b7fe-011d0d4c980d	true	id.token.claim
b62de241-3477-4e9d-b7fe-011d0d4c980d	true	access.token.claim
b62de241-3477-4e9d-b7fe-011d0d4c980d	zoneinfo	claim.name
b62de241-3477-4e9d-b7fe-011d0d4c980d	String	jsonType.label
b9bfe3a1-c30c-4a26-9d00-d3f126084cd6	true	introspection.token.claim
b9bfe3a1-c30c-4a26-9d00-d3f126084cd6	true	userinfo.token.claim
b9bfe3a1-c30c-4a26-9d00-d3f126084cd6	updatedAt	user.attribute
b9bfe3a1-c30c-4a26-9d00-d3f126084cd6	true	id.token.claim
b9bfe3a1-c30c-4a26-9d00-d3f126084cd6	true	access.token.claim
b9bfe3a1-c30c-4a26-9d00-d3f126084cd6	updated_at	claim.name
b9bfe3a1-c30c-4a26-9d00-d3f126084cd6	long	jsonType.label
c92436bd-5084-460e-b467-59912be05275	true	introspection.token.claim
c92436bd-5084-460e-b467-59912be05275	true	userinfo.token.claim
c92436bd-5084-460e-b467-59912be05275	profile	user.attribute
c92436bd-5084-460e-b467-59912be05275	true	id.token.claim
c92436bd-5084-460e-b467-59912be05275	true	access.token.claim
c92436bd-5084-460e-b467-59912be05275	profile	claim.name
c92436bd-5084-460e-b467-59912be05275	String	jsonType.label
277a568e-ed1a-4996-ab46-ec6019c6679a	true	introspection.token.claim
277a568e-ed1a-4996-ab46-ec6019c6679a	true	userinfo.token.claim
277a568e-ed1a-4996-ab46-ec6019c6679a	email	user.attribute
277a568e-ed1a-4996-ab46-ec6019c6679a	true	id.token.claim
277a568e-ed1a-4996-ab46-ec6019c6679a	true	access.token.claim
277a568e-ed1a-4996-ab46-ec6019c6679a	email	claim.name
277a568e-ed1a-4996-ab46-ec6019c6679a	String	jsonType.label
3850e3f0-e575-45ec-917c-f466fc9cddbc	true	introspection.token.claim
3850e3f0-e575-45ec-917c-f466fc9cddbc	true	userinfo.token.claim
3850e3f0-e575-45ec-917c-f466fc9cddbc	emailVerified	user.attribute
3850e3f0-e575-45ec-917c-f466fc9cddbc	true	id.token.claim
3850e3f0-e575-45ec-917c-f466fc9cddbc	true	access.token.claim
3850e3f0-e575-45ec-917c-f466fc9cddbc	email_verified	claim.name
3850e3f0-e575-45ec-917c-f466fc9cddbc	boolean	jsonType.label
13b32888-4e6f-4559-86b3-4392f306d1a1	formatted	user.attribute.formatted
13b32888-4e6f-4559-86b3-4392f306d1a1	country	user.attribute.country
13b32888-4e6f-4559-86b3-4392f306d1a1	true	introspection.token.claim
13b32888-4e6f-4559-86b3-4392f306d1a1	postal_code	user.attribute.postal_code
13b32888-4e6f-4559-86b3-4392f306d1a1	true	userinfo.token.claim
13b32888-4e6f-4559-86b3-4392f306d1a1	street	user.attribute.street
13b32888-4e6f-4559-86b3-4392f306d1a1	true	id.token.claim
13b32888-4e6f-4559-86b3-4392f306d1a1	region	user.attribute.region
13b32888-4e6f-4559-86b3-4392f306d1a1	true	access.token.claim
13b32888-4e6f-4559-86b3-4392f306d1a1	locality	user.attribute.locality
144c4257-2603-467b-9be1-d7b301b18bad	true	introspection.token.claim
144c4257-2603-467b-9be1-d7b301b18bad	true	userinfo.token.claim
144c4257-2603-467b-9be1-d7b301b18bad	phoneNumber	user.attribute
144c4257-2603-467b-9be1-d7b301b18bad	true	id.token.claim
144c4257-2603-467b-9be1-d7b301b18bad	true	access.token.claim
144c4257-2603-467b-9be1-d7b301b18bad	phone_number	claim.name
144c4257-2603-467b-9be1-d7b301b18bad	String	jsonType.label
63209716-64b5-405a-a97a-7e638fd89208	true	introspection.token.claim
63209716-64b5-405a-a97a-7e638fd89208	true	userinfo.token.claim
63209716-64b5-405a-a97a-7e638fd89208	phoneNumberVerified	user.attribute
63209716-64b5-405a-a97a-7e638fd89208	true	id.token.claim
63209716-64b5-405a-a97a-7e638fd89208	true	access.token.claim
63209716-64b5-405a-a97a-7e638fd89208	phone_number_verified	claim.name
63209716-64b5-405a-a97a-7e638fd89208	boolean	jsonType.label
68056de9-2efe-44c4-8a40-62de9d08d53c	true	introspection.token.claim
68056de9-2efe-44c4-8a40-62de9d08d53c	true	multivalued
68056de9-2efe-44c4-8a40-62de9d08d53c	foo	user.attribute
68056de9-2efe-44c4-8a40-62de9d08d53c	true	access.token.claim
68056de9-2efe-44c4-8a40-62de9d08d53c	resource_access.${client_id}.roles	claim.name
68056de9-2efe-44c4-8a40-62de9d08d53c	String	jsonType.label
8472df33-7903-4c09-a7bb-e17fcb9ebd60	true	introspection.token.claim
8472df33-7903-4c09-a7bb-e17fcb9ebd60	true	multivalued
8472df33-7903-4c09-a7bb-e17fcb9ebd60	foo	user.attribute
8472df33-7903-4c09-a7bb-e17fcb9ebd60	true	access.token.claim
8472df33-7903-4c09-a7bb-e17fcb9ebd60	realm_access.roles	claim.name
8472df33-7903-4c09-a7bb-e17fcb9ebd60	String	jsonType.label
8d5ae166-56fb-4826-b190-b640badedda7	true	introspection.token.claim
8d5ae166-56fb-4826-b190-b640badedda7	true	access.token.claim
3893d9bc-709e-47a8-9eea-5f91ee43f91a	true	introspection.token.claim
3893d9bc-709e-47a8-9eea-5f91ee43f91a	true	access.token.claim
413d10ae-42ad-4775-b00a-4c03c8a7adec	true	introspection.token.claim
413d10ae-42ad-4775-b00a-4c03c8a7adec	true	userinfo.token.claim
413d10ae-42ad-4775-b00a-4c03c8a7adec	username	user.attribute
413d10ae-42ad-4775-b00a-4c03c8a7adec	true	id.token.claim
413d10ae-42ad-4775-b00a-4c03c8a7adec	true	access.token.claim
413d10ae-42ad-4775-b00a-4c03c8a7adec	upn	claim.name
413d10ae-42ad-4775-b00a-4c03c8a7adec	String	jsonType.label
c41fd0ed-5d38-4f86-a386-bfc727817ad2	true	introspection.token.claim
c41fd0ed-5d38-4f86-a386-bfc727817ad2	true	multivalued
c41fd0ed-5d38-4f86-a386-bfc727817ad2	foo	user.attribute
c41fd0ed-5d38-4f86-a386-bfc727817ad2	true	id.token.claim
c41fd0ed-5d38-4f86-a386-bfc727817ad2	true	access.token.claim
c41fd0ed-5d38-4f86-a386-bfc727817ad2	groups	claim.name
c41fd0ed-5d38-4f86-a386-bfc727817ad2	String	jsonType.label
a4822e55-7635-4557-bd67-f9bb21ac1534	true	introspection.token.claim
a4822e55-7635-4557-bd67-f9bb21ac1534	true	id.token.claim
a4822e55-7635-4557-bd67-f9bb21ac1534	true	access.token.claim
6bf0f06f-dcd3-43f8-9739-7b8596c93629	AUTH_TIME	user.session.note
6bf0f06f-dcd3-43f8-9739-7b8596c93629	true	introspection.token.claim
6bf0f06f-dcd3-43f8-9739-7b8596c93629	true	id.token.claim
6bf0f06f-dcd3-43f8-9739-7b8596c93629	true	access.token.claim
6bf0f06f-dcd3-43f8-9739-7b8596c93629	auth_time	claim.name
6bf0f06f-dcd3-43f8-9739-7b8596c93629	long	jsonType.label
931dcda6-b1fd-43a5-8cf2-442588fa8449	true	introspection.token.claim
931dcda6-b1fd-43a5-8cf2-442588fa8449	true	access.token.claim
21b21d12-d3d5-4ac9-8653-2a9dd27ab9da	client_id	user.session.note
21b21d12-d3d5-4ac9-8653-2a9dd27ab9da	true	introspection.token.claim
21b21d12-d3d5-4ac9-8653-2a9dd27ab9da	true	id.token.claim
21b21d12-d3d5-4ac9-8653-2a9dd27ab9da	true	access.token.claim
21b21d12-d3d5-4ac9-8653-2a9dd27ab9da	client_id	claim.name
21b21d12-d3d5-4ac9-8653-2a9dd27ab9da	String	jsonType.label
4c7008e6-a87e-4f31-9b2c-15210ea6127d	clientAddress	user.session.note
4c7008e6-a87e-4f31-9b2c-15210ea6127d	true	introspection.token.claim
4c7008e6-a87e-4f31-9b2c-15210ea6127d	true	id.token.claim
4c7008e6-a87e-4f31-9b2c-15210ea6127d	true	access.token.claim
4c7008e6-a87e-4f31-9b2c-15210ea6127d	clientAddress	claim.name
4c7008e6-a87e-4f31-9b2c-15210ea6127d	String	jsonType.label
759d69a3-a2d0-4e35-86bf-d7b99545112e	clientHost	user.session.note
759d69a3-a2d0-4e35-86bf-d7b99545112e	true	introspection.token.claim
759d69a3-a2d0-4e35-86bf-d7b99545112e	true	id.token.claim
759d69a3-a2d0-4e35-86bf-d7b99545112e	true	access.token.claim
759d69a3-a2d0-4e35-86bf-d7b99545112e	clientHost	claim.name
759d69a3-a2d0-4e35-86bf-d7b99545112e	String	jsonType.label
11056b9a-42cd-41e8-9e07-2b6963336b86	true	introspection.token.claim
11056b9a-42cd-41e8-9e07-2b6963336b86	true	multivalued
11056b9a-42cd-41e8-9e07-2b6963336b86	true	id.token.claim
11056b9a-42cd-41e8-9e07-2b6963336b86	true	access.token.claim
11056b9a-42cd-41e8-9e07-2b6963336b86	organization	claim.name
11056b9a-42cd-41e8-9e07-2b6963336b86	String	jsonType.label
b50109de-9bb3-4462-af6d-88212a62a036	false	single
b50109de-9bb3-4462-af6d-88212a62a036	Basic	attribute.nameformat
b50109de-9bb3-4462-af6d-88212a62a036	Role	attribute.name
271ff918-2dc1-450a-8e73-93ed62fcdf14	true	introspection.token.claim
271ff918-2dc1-450a-8e73-93ed62fcdf14	true	userinfo.token.claim
271ff918-2dc1-450a-8e73-93ed62fcdf14	true	id.token.claim
271ff918-2dc1-450a-8e73-93ed62fcdf14	true	access.token.claim
33fe4aac-ec2d-45a6-ac43-3fb5be52020a	true	introspection.token.claim
33fe4aac-ec2d-45a6-ac43-3fb5be52020a	true	userinfo.token.claim
33fe4aac-ec2d-45a6-ac43-3fb5be52020a	firstName	user.attribute
33fe4aac-ec2d-45a6-ac43-3fb5be52020a	true	id.token.claim
33fe4aac-ec2d-45a6-ac43-3fb5be52020a	true	access.token.claim
33fe4aac-ec2d-45a6-ac43-3fb5be52020a	given_name	claim.name
33fe4aac-ec2d-45a6-ac43-3fb5be52020a	String	jsonType.label
3aeffb99-c129-4318-bd34-16c333f4d39b	true	introspection.token.claim
3aeffb99-c129-4318-bd34-16c333f4d39b	true	userinfo.token.claim
3aeffb99-c129-4318-bd34-16c333f4d39b	profile	user.attribute
3aeffb99-c129-4318-bd34-16c333f4d39b	true	id.token.claim
3aeffb99-c129-4318-bd34-16c333f4d39b	true	access.token.claim
3aeffb99-c129-4318-bd34-16c333f4d39b	profile	claim.name
3aeffb99-c129-4318-bd34-16c333f4d39b	String	jsonType.label
47e803cc-2485-488f-b4bd-f15809d0f9bb	true	introspection.token.claim
47e803cc-2485-488f-b4bd-f15809d0f9bb	true	userinfo.token.claim
47e803cc-2485-488f-b4bd-f15809d0f9bb	username	user.attribute
47e803cc-2485-488f-b4bd-f15809d0f9bb	true	id.token.claim
47e803cc-2485-488f-b4bd-f15809d0f9bb	true	access.token.claim
47e803cc-2485-488f-b4bd-f15809d0f9bb	preferred_username	claim.name
47e803cc-2485-488f-b4bd-f15809d0f9bb	String	jsonType.label
596c2b72-075c-4333-9ca2-d1e00e3eed97	true	introspection.token.claim
596c2b72-075c-4333-9ca2-d1e00e3eed97	true	userinfo.token.claim
596c2b72-075c-4333-9ca2-d1e00e3eed97	website	user.attribute
596c2b72-075c-4333-9ca2-d1e00e3eed97	true	id.token.claim
596c2b72-075c-4333-9ca2-d1e00e3eed97	true	access.token.claim
596c2b72-075c-4333-9ca2-d1e00e3eed97	website	claim.name
596c2b72-075c-4333-9ca2-d1e00e3eed97	String	jsonType.label
7b3f46b0-99e3-4e5e-8dcc-7590df7443d6	true	introspection.token.claim
7b3f46b0-99e3-4e5e-8dcc-7590df7443d6	true	userinfo.token.claim
7b3f46b0-99e3-4e5e-8dcc-7590df7443d6	picture	user.attribute
7b3f46b0-99e3-4e5e-8dcc-7590df7443d6	true	id.token.claim
7b3f46b0-99e3-4e5e-8dcc-7590df7443d6	true	access.token.claim
7b3f46b0-99e3-4e5e-8dcc-7590df7443d6	picture	claim.name
7b3f46b0-99e3-4e5e-8dcc-7590df7443d6	String	jsonType.label
858eb0b3-bf06-4ea6-9fd4-c5f07746cdcd	true	introspection.token.claim
858eb0b3-bf06-4ea6-9fd4-c5f07746cdcd	true	userinfo.token.claim
858eb0b3-bf06-4ea6-9fd4-c5f07746cdcd	birthdate	user.attribute
858eb0b3-bf06-4ea6-9fd4-c5f07746cdcd	true	id.token.claim
858eb0b3-bf06-4ea6-9fd4-c5f07746cdcd	true	access.token.claim
858eb0b3-bf06-4ea6-9fd4-c5f07746cdcd	birthdate	claim.name
858eb0b3-bf06-4ea6-9fd4-c5f07746cdcd	String	jsonType.label
8f9cb361-d005-4a74-ad6c-aaa97ea0046f	true	introspection.token.claim
8f9cb361-d005-4a74-ad6c-aaa97ea0046f	true	userinfo.token.claim
8f9cb361-d005-4a74-ad6c-aaa97ea0046f	lastName	user.attribute
8f9cb361-d005-4a74-ad6c-aaa97ea0046f	true	id.token.claim
8f9cb361-d005-4a74-ad6c-aaa97ea0046f	true	access.token.claim
8f9cb361-d005-4a74-ad6c-aaa97ea0046f	family_name	claim.name
8f9cb361-d005-4a74-ad6c-aaa97ea0046f	String	jsonType.label
9b6078a3-3021-4594-a608-dfceff3746a5	true	introspection.token.claim
9b6078a3-3021-4594-a608-dfceff3746a5	true	userinfo.token.claim
9b6078a3-3021-4594-a608-dfceff3746a5	zoneinfo	user.attribute
9b6078a3-3021-4594-a608-dfceff3746a5	true	id.token.claim
9b6078a3-3021-4594-a608-dfceff3746a5	true	access.token.claim
9b6078a3-3021-4594-a608-dfceff3746a5	zoneinfo	claim.name
9b6078a3-3021-4594-a608-dfceff3746a5	String	jsonType.label
9b8096d1-0550-421c-8e5c-0f789471e2db	true	introspection.token.claim
9b8096d1-0550-421c-8e5c-0f789471e2db	true	userinfo.token.claim
9b8096d1-0550-421c-8e5c-0f789471e2db	locale	user.attribute
9b8096d1-0550-421c-8e5c-0f789471e2db	true	id.token.claim
9b8096d1-0550-421c-8e5c-0f789471e2db	true	access.token.claim
9b8096d1-0550-421c-8e5c-0f789471e2db	locale	claim.name
9b8096d1-0550-421c-8e5c-0f789471e2db	String	jsonType.label
a089aa00-b65c-43d8-9d90-4510b18a32c6	true	introspection.token.claim
a089aa00-b65c-43d8-9d90-4510b18a32c6	true	userinfo.token.claim
a089aa00-b65c-43d8-9d90-4510b18a32c6	middleName	user.attribute
a089aa00-b65c-43d8-9d90-4510b18a32c6	true	id.token.claim
a089aa00-b65c-43d8-9d90-4510b18a32c6	true	access.token.claim
a089aa00-b65c-43d8-9d90-4510b18a32c6	middle_name	claim.name
a089aa00-b65c-43d8-9d90-4510b18a32c6	String	jsonType.label
a718f616-dc4e-42c1-a546-9d459ab8397a	true	introspection.token.claim
a718f616-dc4e-42c1-a546-9d459ab8397a	true	userinfo.token.claim
a718f616-dc4e-42c1-a546-9d459ab8397a	updatedAt	user.attribute
a718f616-dc4e-42c1-a546-9d459ab8397a	true	id.token.claim
a718f616-dc4e-42c1-a546-9d459ab8397a	true	access.token.claim
a718f616-dc4e-42c1-a546-9d459ab8397a	updated_at	claim.name
a718f616-dc4e-42c1-a546-9d459ab8397a	long	jsonType.label
d8abb9ff-39e3-4800-b823-cb17734f7d29	true	introspection.token.claim
d8abb9ff-39e3-4800-b823-cb17734f7d29	true	userinfo.token.claim
d8abb9ff-39e3-4800-b823-cb17734f7d29	nickname	user.attribute
d8abb9ff-39e3-4800-b823-cb17734f7d29	true	id.token.claim
d8abb9ff-39e3-4800-b823-cb17734f7d29	true	access.token.claim
d8abb9ff-39e3-4800-b823-cb17734f7d29	nickname	claim.name
d8abb9ff-39e3-4800-b823-cb17734f7d29	String	jsonType.label
f38f5698-3d29-492a-a309-e5e50dd4a8a0	true	introspection.token.claim
f38f5698-3d29-492a-a309-e5e50dd4a8a0	true	userinfo.token.claim
f38f5698-3d29-492a-a309-e5e50dd4a8a0	gender	user.attribute
f38f5698-3d29-492a-a309-e5e50dd4a8a0	true	id.token.claim
f38f5698-3d29-492a-a309-e5e50dd4a8a0	true	access.token.claim
f38f5698-3d29-492a-a309-e5e50dd4a8a0	gender	claim.name
f38f5698-3d29-492a-a309-e5e50dd4a8a0	String	jsonType.label
6186104e-1e05-4036-a3cb-2e82ded0ee25	true	introspection.token.claim
6186104e-1e05-4036-a3cb-2e82ded0ee25	true	userinfo.token.claim
6186104e-1e05-4036-a3cb-2e82ded0ee25	emailVerified	user.attribute
6186104e-1e05-4036-a3cb-2e82ded0ee25	true	id.token.claim
6186104e-1e05-4036-a3cb-2e82ded0ee25	true	access.token.claim
6186104e-1e05-4036-a3cb-2e82ded0ee25	email_verified	claim.name
6186104e-1e05-4036-a3cb-2e82ded0ee25	boolean	jsonType.label
d72f6270-968a-4fcb-880e-206dbe9b8e7e	true	introspection.token.claim
d72f6270-968a-4fcb-880e-206dbe9b8e7e	true	userinfo.token.claim
d72f6270-968a-4fcb-880e-206dbe9b8e7e	email	user.attribute
d72f6270-968a-4fcb-880e-206dbe9b8e7e	true	id.token.claim
d72f6270-968a-4fcb-880e-206dbe9b8e7e	true	access.token.claim
d72f6270-968a-4fcb-880e-206dbe9b8e7e	email	claim.name
d72f6270-968a-4fcb-880e-206dbe9b8e7e	String	jsonType.label
199a4e5c-b9c3-48ac-b764-c1f91b45efc6	formatted	user.attribute.formatted
199a4e5c-b9c3-48ac-b764-c1f91b45efc6	country	user.attribute.country
199a4e5c-b9c3-48ac-b764-c1f91b45efc6	true	introspection.token.claim
199a4e5c-b9c3-48ac-b764-c1f91b45efc6	postal_code	user.attribute.postal_code
199a4e5c-b9c3-48ac-b764-c1f91b45efc6	true	userinfo.token.claim
199a4e5c-b9c3-48ac-b764-c1f91b45efc6	street	user.attribute.street
199a4e5c-b9c3-48ac-b764-c1f91b45efc6	true	id.token.claim
199a4e5c-b9c3-48ac-b764-c1f91b45efc6	region	user.attribute.region
199a4e5c-b9c3-48ac-b764-c1f91b45efc6	true	access.token.claim
199a4e5c-b9c3-48ac-b764-c1f91b45efc6	locality	user.attribute.locality
1aa85dd8-f084-41fe-8192-c74c59aaa32b	true	introspection.token.claim
1aa85dd8-f084-41fe-8192-c74c59aaa32b	true	userinfo.token.claim
1aa85dd8-f084-41fe-8192-c74c59aaa32b	phoneNumber	user.attribute
1aa85dd8-f084-41fe-8192-c74c59aaa32b	true	id.token.claim
1aa85dd8-f084-41fe-8192-c74c59aaa32b	true	access.token.claim
1aa85dd8-f084-41fe-8192-c74c59aaa32b	phone_number	claim.name
1aa85dd8-f084-41fe-8192-c74c59aaa32b	String	jsonType.label
3a70af9a-d88d-4ccb-aaaf-aaccb42a49e2	true	introspection.token.claim
3a70af9a-d88d-4ccb-aaaf-aaccb42a49e2	true	userinfo.token.claim
3a70af9a-d88d-4ccb-aaaf-aaccb42a49e2	phoneNumberVerified	user.attribute
3a70af9a-d88d-4ccb-aaaf-aaccb42a49e2	true	id.token.claim
3a70af9a-d88d-4ccb-aaaf-aaccb42a49e2	true	access.token.claim
3a70af9a-d88d-4ccb-aaaf-aaccb42a49e2	phone_number_verified	claim.name
3a70af9a-d88d-4ccb-aaaf-aaccb42a49e2	boolean	jsonType.label
5d99b2c7-9f02-4b76-9d5d-f40da59a5bf6	true	introspection.token.claim
5d99b2c7-9f02-4b76-9d5d-f40da59a5bf6	true	multivalued
5d99b2c7-9f02-4b76-9d5d-f40da59a5bf6	foo	user.attribute
5d99b2c7-9f02-4b76-9d5d-f40da59a5bf6	true	access.token.claim
5d99b2c7-9f02-4b76-9d5d-f40da59a5bf6	realm_access.roles	claim.name
5d99b2c7-9f02-4b76-9d5d-f40da59a5bf6	String	jsonType.label
8577c302-36f5-477e-9b78-f007c6696ecb	true	introspection.token.claim
8577c302-36f5-477e-9b78-f007c6696ecb	true	multivalued
8577c302-36f5-477e-9b78-f007c6696ecb	foo	user.attribute
8577c302-36f5-477e-9b78-f007c6696ecb	true	access.token.claim
8577c302-36f5-477e-9b78-f007c6696ecb	resource_access.${client_id}.roles	claim.name
8577c302-36f5-477e-9b78-f007c6696ecb	String	jsonType.label
8c8694c2-1fa4-4cb7-8c80-449506c62a13	true	introspection.token.claim
8c8694c2-1fa4-4cb7-8c80-449506c62a13	true	access.token.claim
2b4a744f-3ccc-48f8-91fc-ad2fb2104c59	true	introspection.token.claim
2b4a744f-3ccc-48f8-91fc-ad2fb2104c59	true	access.token.claim
54dbe448-eadc-4e31-9e70-c8b22a93fcc1	true	introspection.token.claim
54dbe448-eadc-4e31-9e70-c8b22a93fcc1	true	multivalued
54dbe448-eadc-4e31-9e70-c8b22a93fcc1	foo	user.attribute
54dbe448-eadc-4e31-9e70-c8b22a93fcc1	true	id.token.claim
54dbe448-eadc-4e31-9e70-c8b22a93fcc1	true	access.token.claim
54dbe448-eadc-4e31-9e70-c8b22a93fcc1	groups	claim.name
54dbe448-eadc-4e31-9e70-c8b22a93fcc1	String	jsonType.label
d1c47efa-3156-482f-98cf-26d4223d12ff	true	introspection.token.claim
d1c47efa-3156-482f-98cf-26d4223d12ff	true	userinfo.token.claim
d1c47efa-3156-482f-98cf-26d4223d12ff	username	user.attribute
d1c47efa-3156-482f-98cf-26d4223d12ff	true	id.token.claim
d1c47efa-3156-482f-98cf-26d4223d12ff	true	access.token.claim
d1c47efa-3156-482f-98cf-26d4223d12ff	upn	claim.name
d1c47efa-3156-482f-98cf-26d4223d12ff	String	jsonType.label
b0c08a30-0da4-498a-9311-6c8ad6ee27e5	true	introspection.token.claim
b0c08a30-0da4-498a-9311-6c8ad6ee27e5	true	id.token.claim
b0c08a30-0da4-498a-9311-6c8ad6ee27e5	true	access.token.claim
91d388c9-fd3f-4b5e-ab3d-4985193b88fe	AUTH_TIME	user.session.note
91d388c9-fd3f-4b5e-ab3d-4985193b88fe	true	introspection.token.claim
91d388c9-fd3f-4b5e-ab3d-4985193b88fe	true	id.token.claim
91d388c9-fd3f-4b5e-ab3d-4985193b88fe	true	access.token.claim
91d388c9-fd3f-4b5e-ab3d-4985193b88fe	auth_time	claim.name
91d388c9-fd3f-4b5e-ab3d-4985193b88fe	long	jsonType.label
ef14e806-a175-4a2d-b734-998669c981e4	true	introspection.token.claim
ef14e806-a175-4a2d-b734-998669c981e4	true	access.token.claim
58e0151b-7009-4083-b47f-abc37b807187	clientAddress	user.session.note
58e0151b-7009-4083-b47f-abc37b807187	true	introspection.token.claim
58e0151b-7009-4083-b47f-abc37b807187	true	id.token.claim
58e0151b-7009-4083-b47f-abc37b807187	true	access.token.claim
58e0151b-7009-4083-b47f-abc37b807187	clientAddress	claim.name
58e0151b-7009-4083-b47f-abc37b807187	String	jsonType.label
87c0e431-fbed-43c3-8ab8-3d31694dfcf2	client_id	user.session.note
87c0e431-fbed-43c3-8ab8-3d31694dfcf2	true	introspection.token.claim
87c0e431-fbed-43c3-8ab8-3d31694dfcf2	true	id.token.claim
87c0e431-fbed-43c3-8ab8-3d31694dfcf2	true	access.token.claim
87c0e431-fbed-43c3-8ab8-3d31694dfcf2	client_id	claim.name
87c0e431-fbed-43c3-8ab8-3d31694dfcf2	String	jsonType.label
a4245249-5543-4511-958c-9f8b42696629	clientHost	user.session.note
a4245249-5543-4511-958c-9f8b42696629	true	introspection.token.claim
a4245249-5543-4511-958c-9f8b42696629	true	id.token.claim
a4245249-5543-4511-958c-9f8b42696629	true	access.token.claim
a4245249-5543-4511-958c-9f8b42696629	clientHost	claim.name
a4245249-5543-4511-958c-9f8b42696629	String	jsonType.label
31927479-69e1-40bc-8986-2791c2838ad3	true	introspection.token.claim
31927479-69e1-40bc-8986-2791c2838ad3	true	multivalued
31927479-69e1-40bc-8986-2791c2838ad3	true	id.token.claim
31927479-69e1-40bc-8986-2791c2838ad3	true	access.token.claim
31927479-69e1-40bc-8986-2791c2838ad3	organization	claim.name
31927479-69e1-40bc-8986-2791c2838ad3	String	jsonType.label
f36602c9-1f5b-424c-800b-1e527bafea6e	true	introspection.token.claim
f36602c9-1f5b-424c-800b-1e527bafea6e	true	userinfo.token.claim
f36602c9-1f5b-424c-800b-1e527bafea6e	locale	user.attribute
f36602c9-1f5b-424c-800b-1e527bafea6e	true	id.token.claim
f36602c9-1f5b-424c-800b-1e527bafea6e	true	access.token.claim
f36602c9-1f5b-424c-800b-1e527bafea6e	locale	claim.name
f36602c9-1f5b-424c-800b-1e527bafea6e	String	jsonType.label
\.


-- ============================================================================
-- Data for table: keycloak_role
-- ============================================================================

COPY public.keycloak_role (id, client_realm_constraint, client_role, description, name, realm_id, client, realm) FROM stdin;
aec4465f-bce6-4a27-b35d-b5eed1fa9642	6325ed20-8593-447d-95ca-17e4271cc794	f	${role_default-roles}	default-roles-master	6325ed20-8593-447d-95ca-17e4271cc794	\N	\N
693e2544-cfca-4804-b289-7bb6f2052fe0	6325ed20-8593-447d-95ca-17e4271cc794	f	${role_admin}	admin	6325ed20-8593-447d-95ca-17e4271cc794	\N	\N
c456d2d8-c82a-4e7b-8b15-1c836d45f40a	6325ed20-8593-447d-95ca-17e4271cc794	f	${role_create-realm}	create-realm	6325ed20-8593-447d-95ca-17e4271cc794	\N	\N
7a0b3ff9-e2b9-43c4-b400-2380aaf83745	5b648c89-4b90-4c9a-a8e1-c0b0cb1bab07	t	${role_create-client}	create-client	6325ed20-8593-447d-95ca-17e4271cc794	5b648c89-4b90-4c9a-a8e1-c0b0cb1bab07	\N
c543ba61-a31c-4b86-8a7b-7057abc957ed	5b648c89-4b90-4c9a-a8e1-c0b0cb1bab07	t	${role_view-realm}	view-realm	6325ed20-8593-447d-95ca-17e4271cc794	5b648c89-4b90-4c9a-a8e1-c0b0cb1bab07	\N
91e1eb27-cb25-4b6e-83d7-b5d9cad8fd2d	5b648c89-4b90-4c9a-a8e1-c0b0cb1bab07	t	${role_view-users}	view-users	6325ed20-8593-447d-95ca-17e4271cc794	5b648c89-4b90-4c9a-a8e1-c0b0cb1bab07	\N
b4254576-1e1d-4631-949e-abad30f0971e	5b648c89-4b90-4c9a-a8e1-c0b0cb1bab07	t	${role_view-clients}	view-clients	6325ed20-8593-447d-95ca-17e4271cc794	5b648c89-4b90-4c9a-a8e1-c0b0cb1bab07	\N
991f85af-b313-48e9-90fe-3f96b772890b	5b648c89-4b90-4c9a-a8e1-c0b0cb1bab07	t	${role_view-events}	view-events	6325ed20-8593-447d-95ca-17e4271cc794	5b648c89-4b90-4c9a-a8e1-c0b0cb1bab07	\N
d1d38fa0-331a-4dac-b697-aad3ff96c0df	5b648c89-4b90-4c9a-a8e1-c0b0cb1bab07	t	${role_view-identity-providers}	view-identity-providers	6325ed20-8593-447d-95ca-17e4271cc794	5b648c89-4b90-4c9a-a8e1-c0b0cb1bab07	\N
2d16d6a8-f373-4333-b262-b11952715245	5b648c89-4b90-4c9a-a8e1-c0b0cb1bab07	t	${role_view-authorization}	view-authorization	6325ed20-8593-447d-95ca-17e4271cc794	5b648c89-4b90-4c9a-a8e1-c0b0cb1bab07	\N
f8a811c4-7246-4e71-937d-975eb5aa0214	5b648c89-4b90-4c9a-a8e1-c0b0cb1bab07	t	${role_manage-realm}	manage-realm	6325ed20-8593-447d-95ca-17e4271cc794	5b648c89-4b90-4c9a-a8e1-c0b0cb1bab07	\N
7af9dedb-1fed-4700-aa32-f2c703c10314	5b648c89-4b90-4c9a-a8e1-c0b0cb1bab07	t	${role_manage-users}	manage-users	6325ed20-8593-447d-95ca-17e4271cc794	5b648c89-4b90-4c9a-a8e1-c0b0cb1bab07	\N
aca6b892-d790-4b8e-9c7f-aa2edddd7107	5b648c89-4b90-4c9a-a8e1-c0b0cb1bab07	t	${role_manage-clients}	manage-clients	6325ed20-8593-447d-95ca-17e4271cc794	5b648c89-4b90-4c9a-a8e1-c0b0cb1bab07	\N
f0634465-c03c-4571-838a-198c1a79d735	5b648c89-4b90-4c9a-a8e1-c0b0cb1bab07	t	${role_manage-events}	manage-events	6325ed20-8593-447d-95ca-17e4271cc794	5b648c89-4b90-4c9a-a8e1-c0b0cb1bab07	\N
41398663-abbb-4e2e-a4b6-7e244bd7ec7d	5b648c89-4b90-4c9a-a8e1-c0b0cb1bab07	t	${role_manage-identity-providers}	manage-identity-providers	6325ed20-8593-447d-95ca-17e4271cc794	5b648c89-4b90-4c9a-a8e1-c0b0cb1bab07	\N
2e26023b-6d8e-4aa3-903b-6b5843350d53	5b648c89-4b90-4c9a-a8e1-c0b0cb1bab07	t	${role_manage-authorization}	manage-authorization	6325ed20-8593-447d-95ca-17e4271cc794	5b648c89-4b90-4c9a-a8e1-c0b0cb1bab07	\N
40340fa2-7296-49b6-858d-acddb329e611	5b648c89-4b90-4c9a-a8e1-c0b0cb1bab07	t	${role_query-users}	query-users	6325ed20-8593-447d-95ca-17e4271cc794	5b648c89-4b90-4c9a-a8e1-c0b0cb1bab07	\N
8ec9138b-df16-48a8-9741-6579f94a52c7	5b648c89-4b90-4c9a-a8e1-c0b0cb1bab07	t	${role_query-clients}	query-clients	6325ed20-8593-447d-95ca-17e4271cc794	5b648c89-4b90-4c9a-a8e1-c0b0cb1bab07	\N
1956bd13-95d8-42f5-905e-2d54f33671e9	5b648c89-4b90-4c9a-a8e1-c0b0cb1bab07	t	${role_query-realms}	query-realms	6325ed20-8593-447d-95ca-17e4271cc794	5b648c89-4b90-4c9a-a8e1-c0b0cb1bab07	\N
998789e6-8cb3-4620-a4b0-b12231681618	5b648c89-4b90-4c9a-a8e1-c0b0cb1bab07	t	${role_query-groups}	query-groups	6325ed20-8593-447d-95ca-17e4271cc794	5b648c89-4b90-4c9a-a8e1-c0b0cb1bab07	\N
d6179efc-50fa-4fcf-be42-2166e097085a	7d53ac70-9b08-4170-bcd4-6b7def6ae2c9	t	${role_view-profile}	view-profile	6325ed20-8593-447d-95ca-17e4271cc794	7d53ac70-9b08-4170-bcd4-6b7def6ae2c9	\N
2784964a-7718-4b4e-974a-dc80f0a6dec8	7d53ac70-9b08-4170-bcd4-6b7def6ae2c9	t	${role_manage-account}	manage-account	6325ed20-8593-447d-95ca-17e4271cc794	7d53ac70-9b08-4170-bcd4-6b7def6ae2c9	\N
6aa64783-707c-48ac-9cb0-635615f62587	7d53ac70-9b08-4170-bcd4-6b7def6ae2c9	t	${role_manage-account-links}	manage-account-links	6325ed20-8593-447d-95ca-17e4271cc794	7d53ac70-9b08-4170-bcd4-6b7def6ae2c9	\N
f21b74ff-a551-4d7e-98b1-10674b37a2e7	7d53ac70-9b08-4170-bcd4-6b7def6ae2c9	t	${role_view-applications}	view-applications	6325ed20-8593-447d-95ca-17e4271cc794	7d53ac70-9b08-4170-bcd4-6b7def6ae2c9	\N
156cf0c3-0bdf-4c0d-9ab5-25a07e0f868a	7d53ac70-9b08-4170-bcd4-6b7def6ae2c9	t	${role_view-consent}	view-consent	6325ed20-8593-447d-95ca-17e4271cc794	7d53ac70-9b08-4170-bcd4-6b7def6ae2c9	\N
853b713d-a73d-467d-9de0-b7312b1d858e	7d53ac70-9b08-4170-bcd4-6b7def6ae2c9	t	${role_manage-consent}	manage-consent	6325ed20-8593-447d-95ca-17e4271cc794	7d53ac70-9b08-4170-bcd4-6b7def6ae2c9	\N
151dad08-4937-4c85-9c6c-b5ad0a8ade54	7d53ac70-9b08-4170-bcd4-6b7def6ae2c9	t	${role_view-groups}	view-groups	6325ed20-8593-447d-95ca-17e4271cc794	7d53ac70-9b08-4170-bcd4-6b7def6ae2c9	\N
6686ab4c-c5cc-4977-8e93-e13a4b3d4c2e	7d53ac70-9b08-4170-bcd4-6b7def6ae2c9	t	${role_delete-account}	delete-account	6325ed20-8593-447d-95ca-17e4271cc794	7d53ac70-9b08-4170-bcd4-6b7def6ae2c9	\N
377ea024-a47b-431f-a038-b299b1fa90c8	af70a474-c808-47ee-a0ca-fe4a1a46ad0c	t	${role_read-token}	read-token	6325ed20-8593-447d-95ca-17e4271cc794	af70a474-c808-47ee-a0ca-fe4a1a46ad0c	\N
6c2dfd1a-dfb8-495d-89e1-9bf07f4dc6f8	5b648c89-4b90-4c9a-a8e1-c0b0cb1bab07	t	${role_impersonation}	impersonation	6325ed20-8593-447d-95ca-17e4271cc794	5b648c89-4b90-4c9a-a8e1-c0b0cb1bab07	\N
3a3cdef0-b749-4e9c-9fcd-3af8e68bfe3f	6325ed20-8593-447d-95ca-17e4271cc794	f	${role_offline-access}	offline_access	6325ed20-8593-447d-95ca-17e4271cc794	\N	\N
2f1d2b66-9936-4d38-9400-26dd812e15b4	6325ed20-8593-447d-95ca-17e4271cc794	f	${role_uma_authorization}	uma_authorization	6325ed20-8593-447d-95ca-17e4271cc794	\N	\N
1cec4d75-6e0d-4ba4-a4e0-d6c0cf2a9ac6	5139da68-ccba-407f-a23e-8551400f5c1c	f	${role_default-roles}	default-roles-athyper	5139da68-ccba-407f-a23e-8551400f5c1c	\N	\N
0ebe00f1-91a1-4c3f-8222-fa6e6f24fcf6	4f9f9d93-ba74-424f-a11d-77d3b77c1ac2	t	${role_create-client}	create-client	6325ed20-8593-447d-95ca-17e4271cc794	4f9f9d93-ba74-424f-a11d-77d3b77c1ac2	\N
f41911ce-abbd-4edd-a926-f23aa9699eff	4f9f9d93-ba74-424f-a11d-77d3b77c1ac2	t	${role_view-realm}	view-realm	6325ed20-8593-447d-95ca-17e4271cc794	4f9f9d93-ba74-424f-a11d-77d3b77c1ac2	\N
88f7d26d-1a1a-4703-89b7-f2518caf3cb9	4f9f9d93-ba74-424f-a11d-77d3b77c1ac2	t	${role_view-users}	view-users	6325ed20-8593-447d-95ca-17e4271cc794	4f9f9d93-ba74-424f-a11d-77d3b77c1ac2	\N
1d47e388-ecbf-48c9-a44d-b95bfa01a968	4f9f9d93-ba74-424f-a11d-77d3b77c1ac2	t	${role_view-clients}	view-clients	6325ed20-8593-447d-95ca-17e4271cc794	4f9f9d93-ba74-424f-a11d-77d3b77c1ac2	\N
7fd2ec39-e1b9-47af-bca9-4033ebbee2c8	4f9f9d93-ba74-424f-a11d-77d3b77c1ac2	t	${role_view-events}	view-events	6325ed20-8593-447d-95ca-17e4271cc794	4f9f9d93-ba74-424f-a11d-77d3b77c1ac2	\N
eee07ca8-d62b-4332-b1d5-359cb53155db	4f9f9d93-ba74-424f-a11d-77d3b77c1ac2	t	${role_view-identity-providers}	view-identity-providers	6325ed20-8593-447d-95ca-17e4271cc794	4f9f9d93-ba74-424f-a11d-77d3b77c1ac2	\N
6d86dee2-7024-412b-833e-29e3bf9dc702	4f9f9d93-ba74-424f-a11d-77d3b77c1ac2	t	${role_view-authorization}	view-authorization	6325ed20-8593-447d-95ca-17e4271cc794	4f9f9d93-ba74-424f-a11d-77d3b77c1ac2	\N
ce12c042-913b-441d-accb-fb27c89eb294	4f9f9d93-ba74-424f-a11d-77d3b77c1ac2	t	${role_manage-realm}	manage-realm	6325ed20-8593-447d-95ca-17e4271cc794	4f9f9d93-ba74-424f-a11d-77d3b77c1ac2	\N
238ad677-48aa-446d-b0a7-a315c2806c30	4f9f9d93-ba74-424f-a11d-77d3b77c1ac2	t	${role_manage-users}	manage-users	6325ed20-8593-447d-95ca-17e4271cc794	4f9f9d93-ba74-424f-a11d-77d3b77c1ac2	\N
19ad673f-5627-47a8-97be-135d23535371	4f9f9d93-ba74-424f-a11d-77d3b77c1ac2	t	${role_manage-clients}	manage-clients	6325ed20-8593-447d-95ca-17e4271cc794	4f9f9d93-ba74-424f-a11d-77d3b77c1ac2	\N
458e9f8c-507d-453e-acfb-37c09849fc5e	4f9f9d93-ba74-424f-a11d-77d3b77c1ac2	t	${role_manage-events}	manage-events	6325ed20-8593-447d-95ca-17e4271cc794	4f9f9d93-ba74-424f-a11d-77d3b77c1ac2	\N
819286a6-cabd-472d-bad2-3cc6902afa1a	4f9f9d93-ba74-424f-a11d-77d3b77c1ac2	t	${role_manage-identity-providers}	manage-identity-providers	6325ed20-8593-447d-95ca-17e4271cc794	4f9f9d93-ba74-424f-a11d-77d3b77c1ac2	\N
6504dd0a-3d49-4f8e-a550-eaa41cc38334	4f9f9d93-ba74-424f-a11d-77d3b77c1ac2	t	${role_manage-authorization}	manage-authorization	6325ed20-8593-447d-95ca-17e4271cc794	4f9f9d93-ba74-424f-a11d-77d3b77c1ac2	\N
68ff4208-4b3f-411c-947e-753de106b6e1	4f9f9d93-ba74-424f-a11d-77d3b77c1ac2	t	${role_query-users}	query-users	6325ed20-8593-447d-95ca-17e4271cc794	4f9f9d93-ba74-424f-a11d-77d3b77c1ac2	\N
f7cf6eec-205b-472e-ba7f-11ddaf2ef6c6	4f9f9d93-ba74-424f-a11d-77d3b77c1ac2	t	${role_query-clients}	query-clients	6325ed20-8593-447d-95ca-17e4271cc794	4f9f9d93-ba74-424f-a11d-77d3b77c1ac2	\N
af38de15-af32-469f-84db-06b12be3f314	4f9f9d93-ba74-424f-a11d-77d3b77c1ac2	t	${role_query-realms}	query-realms	6325ed20-8593-447d-95ca-17e4271cc794	4f9f9d93-ba74-424f-a11d-77d3b77c1ac2	\N
576addc7-789b-41f2-8b14-c246676daa66	4f9f9d93-ba74-424f-a11d-77d3b77c1ac2	t	${role_query-groups}	query-groups	6325ed20-8593-447d-95ca-17e4271cc794	4f9f9d93-ba74-424f-a11d-77d3b77c1ac2	\N
4e401c6e-d7da-423b-8ff1-68601c662633	b254af12-29b6-4aed-9ec5-e3566df2db39	t	${role_realm-admin}	realm-admin	5139da68-ccba-407f-a23e-8551400f5c1c	b254af12-29b6-4aed-9ec5-e3566df2db39	\N
c4b68b6e-11e1-4125-98cb-0589adff7c92	b254af12-29b6-4aed-9ec5-e3566df2db39	t	${role_create-client}	create-client	5139da68-ccba-407f-a23e-8551400f5c1c	b254af12-29b6-4aed-9ec5-e3566df2db39	\N
cbe55eac-1ae6-4866-ab99-169d08656b2d	b254af12-29b6-4aed-9ec5-e3566df2db39	t	${role_view-realm}	view-realm	5139da68-ccba-407f-a23e-8551400f5c1c	b254af12-29b6-4aed-9ec5-e3566df2db39	\N
f579fca4-44f8-4906-b2c6-aa191ae4c5b0	b254af12-29b6-4aed-9ec5-e3566df2db39	t	${role_view-users}	view-users	5139da68-ccba-407f-a23e-8551400f5c1c	b254af12-29b6-4aed-9ec5-e3566df2db39	\N
1ce903bb-addf-42d1-8ca3-e53a031a73d9	b254af12-29b6-4aed-9ec5-e3566df2db39	t	${role_view-clients}	view-clients	5139da68-ccba-407f-a23e-8551400f5c1c	b254af12-29b6-4aed-9ec5-e3566df2db39	\N
7e27edbc-3784-4ee2-8729-611ebbcdbd43	b254af12-29b6-4aed-9ec5-e3566df2db39	t	${role_view-events}	view-events	5139da68-ccba-407f-a23e-8551400f5c1c	b254af12-29b6-4aed-9ec5-e3566df2db39	\N
4ea52eb3-13f2-4164-ad6b-b935e423eb0e	b254af12-29b6-4aed-9ec5-e3566df2db39	t	${role_view-identity-providers}	view-identity-providers	5139da68-ccba-407f-a23e-8551400f5c1c	b254af12-29b6-4aed-9ec5-e3566df2db39	\N
3c912bff-9801-42fc-8abf-d56fae1881d1	b254af12-29b6-4aed-9ec5-e3566df2db39	t	${role_view-authorization}	view-authorization	5139da68-ccba-407f-a23e-8551400f5c1c	b254af12-29b6-4aed-9ec5-e3566df2db39	\N
ca252806-c5c6-4f85-9888-42a46ac84d9d	b254af12-29b6-4aed-9ec5-e3566df2db39	t	${role_manage-realm}	manage-realm	5139da68-ccba-407f-a23e-8551400f5c1c	b254af12-29b6-4aed-9ec5-e3566df2db39	\N
1b45dc8c-6e83-4395-894b-6919bbd3c00f	b254af12-29b6-4aed-9ec5-e3566df2db39	t	${role_manage-users}	manage-users	5139da68-ccba-407f-a23e-8551400f5c1c	b254af12-29b6-4aed-9ec5-e3566df2db39	\N
b3a17e8f-69fd-44cc-9f0e-918788cc7980	b254af12-29b6-4aed-9ec5-e3566df2db39	t	${role_manage-clients}	manage-clients	5139da68-ccba-407f-a23e-8551400f5c1c	b254af12-29b6-4aed-9ec5-e3566df2db39	\N
19e1fdd0-f54a-4665-9b91-3f1050f77ad3	b254af12-29b6-4aed-9ec5-e3566df2db39	t	${role_manage-events}	manage-events	5139da68-ccba-407f-a23e-8551400f5c1c	b254af12-29b6-4aed-9ec5-e3566df2db39	\N
b86f5370-56c0-4b89-89f0-3895497656f8	b254af12-29b6-4aed-9ec5-e3566df2db39	t	${role_manage-identity-providers}	manage-identity-providers	5139da68-ccba-407f-a23e-8551400f5c1c	b254af12-29b6-4aed-9ec5-e3566df2db39	\N
d3c22dc6-122e-4552-900c-66970b6dff4d	b254af12-29b6-4aed-9ec5-e3566df2db39	t	${role_manage-authorization}	manage-authorization	5139da68-ccba-407f-a23e-8551400f5c1c	b254af12-29b6-4aed-9ec5-e3566df2db39	\N
1a476985-9839-45fb-b295-168556c354bf	b254af12-29b6-4aed-9ec5-e3566df2db39	t	${role_query-users}	query-users	5139da68-ccba-407f-a23e-8551400f5c1c	b254af12-29b6-4aed-9ec5-e3566df2db39	\N
3e5e0850-8df5-4a37-8292-8f4e13537064	b254af12-29b6-4aed-9ec5-e3566df2db39	t	${role_query-clients}	query-clients	5139da68-ccba-407f-a23e-8551400f5c1c	b254af12-29b6-4aed-9ec5-e3566df2db39	\N
4ba55563-61ba-4d75-92f2-a1caddf465f7	b254af12-29b6-4aed-9ec5-e3566df2db39	t	${role_query-realms}	query-realms	5139da68-ccba-407f-a23e-8551400f5c1c	b254af12-29b6-4aed-9ec5-e3566df2db39	\N
745c97ed-0a07-4b59-9a45-afe242c2d365	b254af12-29b6-4aed-9ec5-e3566df2db39	t	${role_query-groups}	query-groups	5139da68-ccba-407f-a23e-8551400f5c1c	b254af12-29b6-4aed-9ec5-e3566df2db39	\N
0f397286-85be-4791-8e8e-7bec206938c8	f2cfddbb-a923-4fa9-bbda-86a713009f39	t	${role_view-profile}	view-profile	5139da68-ccba-407f-a23e-8551400f5c1c	f2cfddbb-a923-4fa9-bbda-86a713009f39	\N
65f11ac4-8675-4218-a869-91d200c391fb	f2cfddbb-a923-4fa9-bbda-86a713009f39	t	${role_manage-account}	manage-account	5139da68-ccba-407f-a23e-8551400f5c1c	f2cfddbb-a923-4fa9-bbda-86a713009f39	\N
8d0b5b41-e969-4c9f-9575-9fc3be5f230c	f2cfddbb-a923-4fa9-bbda-86a713009f39	t	${role_manage-account-links}	manage-account-links	5139da68-ccba-407f-a23e-8551400f5c1c	f2cfddbb-a923-4fa9-bbda-86a713009f39	\N
89fbc5ee-5dc2-4d5f-b2b9-9527dd562b2e	f2cfddbb-a923-4fa9-bbda-86a713009f39	t	${role_view-applications}	view-applications	5139da68-ccba-407f-a23e-8551400f5c1c	f2cfddbb-a923-4fa9-bbda-86a713009f39	\N
1a51f977-7278-422c-9311-2b1fc36b1c27	f2cfddbb-a923-4fa9-bbda-86a713009f39	t	${role_view-consent}	view-consent	5139da68-ccba-407f-a23e-8551400f5c1c	f2cfddbb-a923-4fa9-bbda-86a713009f39	\N
d86dd5bf-fb27-400c-8f25-b72807eaf875	f2cfddbb-a923-4fa9-bbda-86a713009f39	t	${role_manage-consent}	manage-consent	5139da68-ccba-407f-a23e-8551400f5c1c	f2cfddbb-a923-4fa9-bbda-86a713009f39	\N
af059085-4080-44fc-95c0-e5e315f7ec96	f2cfddbb-a923-4fa9-bbda-86a713009f39	t	${role_view-groups}	view-groups	5139da68-ccba-407f-a23e-8551400f5c1c	f2cfddbb-a923-4fa9-bbda-86a713009f39	\N
2a1e9060-7f78-43c9-93c9-5272870ad7c7	f2cfddbb-a923-4fa9-bbda-86a713009f39	t	${role_delete-account}	delete-account	5139da68-ccba-407f-a23e-8551400f5c1c	f2cfddbb-a923-4fa9-bbda-86a713009f39	\N
7dd5d9f5-99c6-47a0-bdb1-b4efbfb506f9	4f9f9d93-ba74-424f-a11d-77d3b77c1ac2	t	${role_impersonation}	impersonation	6325ed20-8593-447d-95ca-17e4271cc794	4f9f9d93-ba74-424f-a11d-77d3b77c1ac2	\N
c0a2fdea-159b-4ab4-ac4b-e899ea5c09e2	b254af12-29b6-4aed-9ec5-e3566df2db39	t	${role_impersonation}	impersonation	5139da68-ccba-407f-a23e-8551400f5c1c	b254af12-29b6-4aed-9ec5-e3566df2db39	\N
b30c1e67-7c52-4460-8df7-b66ad6c17905	0739b786-0e6e-41f6-9be5-1b0125f159ce	t	${role_read-token}	read-token	5139da68-ccba-407f-a23e-8551400f5c1c	0739b786-0e6e-41f6-9be5-1b0125f159ce	\N
b00ded14-41db-4c54-a991-ea270653b494	5139da68-ccba-407f-a23e-8551400f5c1c	f	${role_offline-access}	offline_access	5139da68-ccba-407f-a23e-8551400f5c1c	\N	\N
f3db517b-8dbc-4675-8629-2fb18450637b	5139da68-ccba-407f-a23e-8551400f5c1c	f	${role_uma_authorization}	uma_authorization	5139da68-ccba-407f-a23e-8551400f5c1c	\N	\N
af6abc0f-076e-459d-868a-18d938681122	fd2341e8-7fdc-42c3-a269-2551e82397d2	t		neon:WORKBENCH:USER	5139da68-ccba-407f-a23e-8551400f5c1c	fd2341e8-7fdc-42c3-a269-2551e82397d2	\N
67d10733-a9d9-404f-a303-5d0a0ba5fea4	fd2341e8-7fdc-42c3-a269-2551e82397d2	t		neon:WORKBENCH:ADMIN	5139da68-ccba-407f-a23e-8551400f5c1c	fd2341e8-7fdc-42c3-a269-2551e82397d2	\N
914fae1f-d75d-4f1e-ab16-3e0ce1717c10	fd2341e8-7fdc-42c3-a269-2551e82397d2	t		neon:WORKBENCH:PARTNER	5139da68-ccba-407f-a23e-8551400f5c1c	fd2341e8-7fdc-42c3-a269-2551e82397d2	\N
5649959f-96c1-4803-aea4-df944537cfa4	fd2341e8-7fdc-42c3-a269-2551e82397d2	t		neon:WORKBENCH:OPS	5139da68-ccba-407f-a23e-8551400f5c1c	fd2341e8-7fdc-42c3-a269-2551e82397d2	\N
24b27ead-28e9-4157-a686-a1bf6165c816	fd2341e8-7fdc-42c3-a269-2551e82397d2	t		neon:PERSONAS:viewer	5139da68-ccba-407f-a23e-8551400f5c1c	fd2341e8-7fdc-42c3-a269-2551e82397d2	\N
143faeab-8baf-491f-a2bb-b259a710d6fb	fd2341e8-7fdc-42c3-a269-2551e82397d2	t		neon:PERSONAS:reporter	5139da68-ccba-407f-a23e-8551400f5c1c	fd2341e8-7fdc-42c3-a269-2551e82397d2	\N
b0f71429-fddc-43d8-b07a-fe1261f84284	fd2341e8-7fdc-42c3-a269-2551e82397d2	t		neon:PERSONAS:requester	5139da68-ccba-407f-a23e-8551400f5c1c	fd2341e8-7fdc-42c3-a269-2551e82397d2	\N
61995392-595e-408a-b3ad-42be38b90380	fd2341e8-7fdc-42c3-a269-2551e82397d2	t		neon:PERSONAS:agent	5139da68-ccba-407f-a23e-8551400f5c1c	fd2341e8-7fdc-42c3-a269-2551e82397d2	\N
76efb915-cda3-4227-9fe5-f5f2c169f3ce	fd2341e8-7fdc-42c3-a269-2551e82397d2	t		neon:PERSONAS:manager	5139da68-ccba-407f-a23e-8551400f5c1c	fd2341e8-7fdc-42c3-a269-2551e82397d2	\N
d690eefc-1477-41e8-ba35-de0eddc73c27	fd2341e8-7fdc-42c3-a269-2551e82397d2	t		neon:PERSONAS:module_admin	5139da68-ccba-407f-a23e-8551400f5c1c	fd2341e8-7fdc-42c3-a269-2551e82397d2	\N
90c0c407-205b-4b9c-a9e0-305f12be18a4	fd2341e8-7fdc-42c3-a269-2551e82397d2	t		neon:PERSONAS:tenant_admin	5139da68-ccba-407f-a23e-8551400f5c1c	fd2341e8-7fdc-42c3-a269-2551e82397d2	\N
b57ca450-c8f8-4ee0-89d0-da157beb0c05	fd2341e8-7fdc-42c3-a269-2551e82397d2	t	Finance (Core Accounting)\nGeneral Ledger, AP, AR, fiscal controls	neon:MODULES:ACC	5139da68-ccba-407f-a23e-8551400f5c1c	fd2341e8-7fdc-42c3-a269-2551e82397d2	\N
cfab2cdf-c5ff-4d7d-8914-33593e17c1bd	fd2341e8-7fdc-42c3-a269-2551e82397d2	t	Payment Processing\nCollections, disbursements, reconciliation	neon:MODULES:PAY	5139da68-ccba-407f-a23e-8551400f5c1c	fd2341e8-7fdc-42c3-a269-2551e82397d2	\N
\.


-- ============================================================================
-- Data for table: composite_role
-- ============================================================================

COPY public.composite_role (composite, child_role) FROM stdin;
693e2544-cfca-4804-b289-7bb6f2052fe0	c456d2d8-c82a-4e7b-8b15-1c836d45f40a
693e2544-cfca-4804-b289-7bb6f2052fe0	7a0b3ff9-e2b9-43c4-b400-2380aaf83745
693e2544-cfca-4804-b289-7bb6f2052fe0	c543ba61-a31c-4b86-8a7b-7057abc957ed
693e2544-cfca-4804-b289-7bb6f2052fe0	91e1eb27-cb25-4b6e-83d7-b5d9cad8fd2d
693e2544-cfca-4804-b289-7bb6f2052fe0	b4254576-1e1d-4631-949e-abad30f0971e
693e2544-cfca-4804-b289-7bb6f2052fe0	991f85af-b313-48e9-90fe-3f96b772890b
693e2544-cfca-4804-b289-7bb6f2052fe0	d1d38fa0-331a-4dac-b697-aad3ff96c0df
693e2544-cfca-4804-b289-7bb6f2052fe0	2d16d6a8-f373-4333-b262-b11952715245
693e2544-cfca-4804-b289-7bb6f2052fe0	f8a811c4-7246-4e71-937d-975eb5aa0214
693e2544-cfca-4804-b289-7bb6f2052fe0	7af9dedb-1fed-4700-aa32-f2c703c10314
693e2544-cfca-4804-b289-7bb6f2052fe0	aca6b892-d790-4b8e-9c7f-aa2edddd7107
693e2544-cfca-4804-b289-7bb6f2052fe0	f0634465-c03c-4571-838a-198c1a79d735
693e2544-cfca-4804-b289-7bb6f2052fe0	41398663-abbb-4e2e-a4b6-7e244bd7ec7d
693e2544-cfca-4804-b289-7bb6f2052fe0	2e26023b-6d8e-4aa3-903b-6b5843350d53
693e2544-cfca-4804-b289-7bb6f2052fe0	40340fa2-7296-49b6-858d-acddb329e611
693e2544-cfca-4804-b289-7bb6f2052fe0	8ec9138b-df16-48a8-9741-6579f94a52c7
693e2544-cfca-4804-b289-7bb6f2052fe0	1956bd13-95d8-42f5-905e-2d54f33671e9
693e2544-cfca-4804-b289-7bb6f2052fe0	998789e6-8cb3-4620-a4b0-b12231681618
91e1eb27-cb25-4b6e-83d7-b5d9cad8fd2d	40340fa2-7296-49b6-858d-acddb329e611
91e1eb27-cb25-4b6e-83d7-b5d9cad8fd2d	998789e6-8cb3-4620-a4b0-b12231681618
aec4465f-bce6-4a27-b35d-b5eed1fa9642	d6179efc-50fa-4fcf-be42-2166e097085a
b4254576-1e1d-4631-949e-abad30f0971e	8ec9138b-df16-48a8-9741-6579f94a52c7
aec4465f-bce6-4a27-b35d-b5eed1fa9642	2784964a-7718-4b4e-974a-dc80f0a6dec8
2784964a-7718-4b4e-974a-dc80f0a6dec8	6aa64783-707c-48ac-9cb0-635615f62587
853b713d-a73d-467d-9de0-b7312b1d858e	156cf0c3-0bdf-4c0d-9ab5-25a07e0f868a
693e2544-cfca-4804-b289-7bb6f2052fe0	6c2dfd1a-dfb8-495d-89e1-9bf07f4dc6f8
aec4465f-bce6-4a27-b35d-b5eed1fa9642	3a3cdef0-b749-4e9c-9fcd-3af8e68bfe3f
aec4465f-bce6-4a27-b35d-b5eed1fa9642	2f1d2b66-9936-4d38-9400-26dd812e15b4
693e2544-cfca-4804-b289-7bb6f2052fe0	0ebe00f1-91a1-4c3f-8222-fa6e6f24fcf6
693e2544-cfca-4804-b289-7bb6f2052fe0	f41911ce-abbd-4edd-a926-f23aa9699eff
693e2544-cfca-4804-b289-7bb6f2052fe0	88f7d26d-1a1a-4703-89b7-f2518caf3cb9
693e2544-cfca-4804-b289-7bb6f2052fe0	1d47e388-ecbf-48c9-a44d-b95bfa01a968
693e2544-cfca-4804-b289-7bb6f2052fe0	7fd2ec39-e1b9-47af-bca9-4033ebbee2c8
693e2544-cfca-4804-b289-7bb6f2052fe0	eee07ca8-d62b-4332-b1d5-359cb53155db
693e2544-cfca-4804-b289-7bb6f2052fe0	6d86dee2-7024-412b-833e-29e3bf9dc702
693e2544-cfca-4804-b289-7bb6f2052fe0	ce12c042-913b-441d-accb-fb27c89eb294
693e2544-cfca-4804-b289-7bb6f2052fe0	238ad677-48aa-446d-b0a7-a315c2806c30
693e2544-cfca-4804-b289-7bb6f2052fe0	19ad673f-5627-47a8-97be-135d23535371
693e2544-cfca-4804-b289-7bb6f2052fe0	458e9f8c-507d-453e-acfb-37c09849fc5e
693e2544-cfca-4804-b289-7bb6f2052fe0	819286a6-cabd-472d-bad2-3cc6902afa1a
693e2544-cfca-4804-b289-7bb6f2052fe0	6504dd0a-3d49-4f8e-a550-eaa41cc38334
693e2544-cfca-4804-b289-7bb6f2052fe0	68ff4208-4b3f-411c-947e-753de106b6e1
693e2544-cfca-4804-b289-7bb6f2052fe0	f7cf6eec-205b-472e-ba7f-11ddaf2ef6c6
693e2544-cfca-4804-b289-7bb6f2052fe0	af38de15-af32-469f-84db-06b12be3f314
693e2544-cfca-4804-b289-7bb6f2052fe0	576addc7-789b-41f2-8b14-c246676daa66
1d47e388-ecbf-48c9-a44d-b95bfa01a968	f7cf6eec-205b-472e-ba7f-11ddaf2ef6c6
88f7d26d-1a1a-4703-89b7-f2518caf3cb9	576addc7-789b-41f2-8b14-c246676daa66
88f7d26d-1a1a-4703-89b7-f2518caf3cb9	68ff4208-4b3f-411c-947e-753de106b6e1
4e401c6e-d7da-423b-8ff1-68601c662633	c4b68b6e-11e1-4125-98cb-0589adff7c92
4e401c6e-d7da-423b-8ff1-68601c662633	cbe55eac-1ae6-4866-ab99-169d08656b2d
4e401c6e-d7da-423b-8ff1-68601c662633	f579fca4-44f8-4906-b2c6-aa191ae4c5b0
4e401c6e-d7da-423b-8ff1-68601c662633	1ce903bb-addf-42d1-8ca3-e53a031a73d9
4e401c6e-d7da-423b-8ff1-68601c662633	7e27edbc-3784-4ee2-8729-611ebbcdbd43
4e401c6e-d7da-423b-8ff1-68601c662633	4ea52eb3-13f2-4164-ad6b-b935e423eb0e
4e401c6e-d7da-423b-8ff1-68601c662633	3c912bff-9801-42fc-8abf-d56fae1881d1
4e401c6e-d7da-423b-8ff1-68601c662633	ca252806-c5c6-4f85-9888-42a46ac84d9d
4e401c6e-d7da-423b-8ff1-68601c662633	1b45dc8c-6e83-4395-894b-6919bbd3c00f
4e401c6e-d7da-423b-8ff1-68601c662633	b3a17e8f-69fd-44cc-9f0e-918788cc7980
4e401c6e-d7da-423b-8ff1-68601c662633	19e1fdd0-f54a-4665-9b91-3f1050f77ad3
4e401c6e-d7da-423b-8ff1-68601c662633	b86f5370-56c0-4b89-89f0-3895497656f8
4e401c6e-d7da-423b-8ff1-68601c662633	d3c22dc6-122e-4552-900c-66970b6dff4d
4e401c6e-d7da-423b-8ff1-68601c662633	1a476985-9839-45fb-b295-168556c354bf
4e401c6e-d7da-423b-8ff1-68601c662633	3e5e0850-8df5-4a37-8292-8f4e13537064
4e401c6e-d7da-423b-8ff1-68601c662633	4ba55563-61ba-4d75-92f2-a1caddf465f7
4e401c6e-d7da-423b-8ff1-68601c662633	745c97ed-0a07-4b59-9a45-afe242c2d365
1ce903bb-addf-42d1-8ca3-e53a031a73d9	3e5e0850-8df5-4a37-8292-8f4e13537064
1cec4d75-6e0d-4ba4-a4e0-d6c0cf2a9ac6	0f397286-85be-4791-8e8e-7bec206938c8
f579fca4-44f8-4906-b2c6-aa191ae4c5b0	1a476985-9839-45fb-b295-168556c354bf
f579fca4-44f8-4906-b2c6-aa191ae4c5b0	745c97ed-0a07-4b59-9a45-afe242c2d365
1cec4d75-6e0d-4ba4-a4e0-d6c0cf2a9ac6	65f11ac4-8675-4218-a869-91d200c391fb
65f11ac4-8675-4218-a869-91d200c391fb	8d0b5b41-e969-4c9f-9575-9fc3be5f230c
d86dd5bf-fb27-400c-8f25-b72807eaf875	1a51f977-7278-422c-9311-2b1fc36b1c27
693e2544-cfca-4804-b289-7bb6f2052fe0	7dd5d9f5-99c6-47a0-bdb1-b4efbfb506f9
4e401c6e-d7da-423b-8ff1-68601c662633	c0a2fdea-159b-4ab4-ac4b-e899ea5c09e2
1cec4d75-6e0d-4ba4-a4e0-d6c0cf2a9ac6	b00ded14-41db-4c54-a991-ea270653b494
1cec4d75-6e0d-4ba4-a4e0-d6c0cf2a9ac6	f3db517b-8dbc-4675-8629-2fb18450637b
\.


-- ============================================================================
-- Data for table: scope_mapping
-- ============================================================================

COPY public.scope_mapping (client_id, role_id) FROM stdin;
3c877b4b-089e-425c-bc98-55fd6cbd88f3	2784964a-7718-4b4e-974a-dc80f0a6dec8
3c877b4b-089e-425c-bc98-55fd6cbd88f3	151dad08-4937-4c85-9c6c-b5ad0a8ade54
4bc52108-2362-481d-a9ca-fc26890b178a	af059085-4080-44fc-95c0-e5e315f7ec96
4bc52108-2362-481d-a9ca-fc26890b178a	65f11ac4-8675-4218-a869-91d200c391fb
\.


-- ============================================================================
-- Data for table: keycloak_group
-- ============================================================================

COPY public.keycloak_group (id, name, parent_group, realm_id, type, description) FROM stdin;
7939d24e-a539-4a93-b5a6-b3ae5e18b31d	7ef25b64-a322-4d4c-8e28-54e955e43cb0	 	5139da68-ccba-407f-a23e-8551400f5c1c	1	\N
25bf9687-3225-4bd1-ada1-abdab0bdd81e	b62a06d8-d904-446a-bdff-9c914102308f	 	5139da68-ccba-407f-a23e-8551400f5c1c	1	\N
9d967fff-37f6-4852-8f77-2fa7a66eaf99	a247e8d0-0483-483b-8432-7f0a3759264b	 	5139da68-ccba-407f-a23e-8551400f5c1c	1	\N
98323d1b-4e21-41bd-9e82-c853c9a48a61	493036ca-28a3-4d3f-ae8e-28d61cd48ba0	 	5139da68-ccba-407f-a23e-8551400f5c1c	1	\N
e5d4a05d-417b-48dc-814f-3d8845a615b7	5c9e36ac-1082-4199-b2fe-bf4293467c9e	 	5139da68-ccba-407f-a23e-8551400f5c1c	1	\N
df828e75-beaa-47db-a3bb-a04f7b99efbf	64ef3f6a-74fc-42b3-8237-27e5c8dd9332	 	5139da68-ccba-407f-a23e-8551400f5c1c	1	\N
fbb0c9bb-1b83-407e-ba0f-64cd020f00e9	47dc7c69-b64b-43b8-897a-70b8225464d5	 	5139da68-ccba-407f-a23e-8551400f5c1c	1	\N
6d6e5371-1f16-405e-a4bf-5433b0613bcf	342dc5ac-b738-4bb5-8243-cb3fc07232d1	 	5139da68-ccba-407f-a23e-8551400f5c1c	1	\N
16d0a161-6043-4b0d-b46e-abf1aec24bad	8939863e-61db-4fbf-8d86-447b0b5ae3ef	 	5139da68-ccba-407f-a23e-8551400f5c1c	1	\N
\.


-- ============================================================================
-- Data for table: group_attribute
-- ============================================================================

COPY public.group_attribute (id, name, value, group_id) FROM stdin;
\.


-- ============================================================================
-- Data for table: group_role_mapping
-- ============================================================================

COPY public.group_role_mapping (role_id, group_id) FROM stdin;
\.


-- ============================================================================
-- Data for table: realm_default_groups
-- ============================================================================

COPY public.realm_default_groups (realm_id, group_id) FROM stdin;
\.


-- ============================================================================
-- Data for table: org
-- ============================================================================

COPY public.org (id, enabled, realm_id, group_id, name, description, alias, redirect_url) FROM stdin;
b62a06d8-d904-446a-bdff-9c914102308f	t	5139da68-ccba-407f-a23e-8551400f5c1c	25bf9687-3225-4bd1-ada1-abdab0bdd81e	demo_in	Demo India	demo_in	\N
7ef25b64-a322-4d4c-8e28-54e955e43cb0	t	5139da68-ccba-407f-a23e-8551400f5c1c	7939d24e-a539-4a93-b5a6-b3ae5e18b31d	demo_my	Demo Malaysia	demo_my	\N
a247e8d0-0483-483b-8432-7f0a3759264b	t	5139da68-ccba-407f-a23e-8551400f5c1c	9d967fff-37f6-4852-8f77-2fa7a66eaf99	demo_sa	Demo Saudi Arabia	demo_sa	\N
493036ca-28a3-4d3f-ae8e-28d61cd48ba0	t	5139da68-ccba-407f-a23e-8551400f5c1c	98323d1b-4e21-41bd-9e82-c853c9a48a61	demo_qa	Demo Qatar	demo_qa	\N
5c9e36ac-1082-4199-b2fe-bf4293467c9e	t	5139da68-ccba-407f-a23e-8551400f5c1c	e5d4a05d-417b-48dc-814f-3d8845a615b7	demo_fr	Demo France	demo_fr	\N
64ef3f6a-74fc-42b3-8237-27e5c8dd9332	t	5139da68-ccba-407f-a23e-8551400f5c1c	df828e75-beaa-47db-a3bb-a04f7b99efbf	demo_de	Demo Germany	demo_de	\N
47dc7c69-b64b-43b8-897a-70b8225464d5	t	5139da68-ccba-407f-a23e-8551400f5c1c	fbb0c9bb-1b83-407e-ba0f-64cd020f00e9	demo_ch	Demo Switzerland	demo_ch	\N
342dc5ac-b738-4bb5-8243-cb3fc07232d1	t	5139da68-ccba-407f-a23e-8551400f5c1c	6d6e5371-1f16-405e-a4bf-5433b0613bcf	demo_us	Demo USA	demo_us	\N
8939863e-61db-4fbf-8d86-447b0b5ae3ef	t	5139da68-ccba-407f-a23e-8551400f5c1c	16d0a161-6043-4b0d-b46e-abf1aec24bad	demo_ca	Demo Canada	demo_ca	\N
\.


-- ============================================================================
-- Data for table: org_domain
-- ============================================================================

COPY public.org_domain (id, name, verified, org_id) FROM stdin;
\.


-- ============================================================================
-- Data for table: user_entity
-- ============================================================================

COPY public.user_entity (id, email, email_constraint, email_verified, enabled, federation_link, first_name, last_name, realm_id, username, created_timestamp, service_account_client_link, not_before) FROM stdin;
2c27d33a-5424-4545-b9b9-77fdea667e36	info@atlasdigitaltech.com	info@atlasdigitaltech.com	t	t	\N	Chandravel	Natarajan	6325ed20-8593-447d-95ca-17e4271cc794	info@atlasdigitaltech.com	1770572897643	\N	0
3b76fefa-de60-4299-8561-3040960b8cea	info@atlasdigitaltech.com	info@atlasdigitaltech.com	t	t	\N	Chandravel	Natarajan	5139da68-ccba-407f-a23e-8551400f5c1c	demomy_viewer	1770586801510	\N	0
\.


-- ============================================================================
-- Data for table: credential
-- ============================================================================

COPY public.credential (id, salt, type, user_id, created_date, user_label, secret_data, credential_data, priority, version) FROM stdin;
5200e288-0d68-4bf3-a902-b50bfbfc4aff	\N	password	2c27d33a-5424-4545-b9b9-77fdea667e36	1770572924478	My password	{"value":"/Yrr+UGUsbgK7zmqpkkZYPpyvb5LTIcaW15y4V/ieKw=","salt":"aGTq5/ZqKi0kxcCgZLYR9w==","additionalParameters":{}}	{"hashIterations":5,"algorithm":"argon2","additionalParameters":{"hashLength":["32"],"memory":["7168"],"type":["id"],"version":["1.3"],"parallelism":["1"]}}	10	1
0cc03140-da99-4f83-b297-1e6b62f379d6	\N	password	3b76fefa-de60-4299-8561-3040960b8cea	1770586822910	My password	{"value":"f9t235zCMOdcpzEEQNZ+U3oONEEU2811rZMWLO+owzE=","salt":"D1HM/TRp+MUfb6I5YXZ1HQ==","additionalParameters":{}}	{"hashIterations":5,"algorithm":"argon2","additionalParameters":{"hashLength":["32"],"memory":["7168"],"type":["id"],"version":["1.3"],"parallelism":["1"]}}	10	1
\.


-- ============================================================================
-- Data for table: user_role_mapping
-- ============================================================================

COPY public.user_role_mapping (role_id, user_id) FROM stdin;
aec4465f-bce6-4a27-b35d-b5eed1fa9642	2c27d33a-5424-4545-b9b9-77fdea667e36
693e2544-cfca-4804-b289-7bb6f2052fe0	2c27d33a-5424-4545-b9b9-77fdea667e36
af6abc0f-076e-459d-868a-18d938681122	3b76fefa-de60-4299-8561-3040960b8cea
cfab2cdf-c5ff-4d7d-8914-33593e17c1bd	3b76fefa-de60-4299-8561-3040960b8cea
b57ca450-c8f8-4ee0-89d0-da157beb0c05	3b76fefa-de60-4299-8561-3040960b8cea
b0f71429-fddc-43d8-b07a-fe1261f84284	3b76fefa-de60-4299-8561-3040960b8cea
\.


-- ============================================================================
-- Data for table: user_group_membership
-- ============================================================================

COPY public.user_group_membership (group_id, user_id, membership_type) FROM stdin;
16d0a161-6043-4b0d-b46e-abf1aec24bad	3b76fefa-de60-4299-8561-3040960b8cea	UNMANAGED
\.


-- ============================================================================
-- Data for table: component
-- ============================================================================

COPY public.component (id, name, parent_id, provider_id, provider_type, realm_id, sub_type) FROM stdin;
eae611ac-a84d-4f92-a24e-1711cacef9e3	Trusted Hosts	6325ed20-8593-447d-95ca-17e4271cc794	trusted-hosts	org.keycloak.services.clientregistration.policy.ClientRegistrationPolicy	6325ed20-8593-447d-95ca-17e4271cc794	anonymous
35768c7f-a97b-4755-afa2-b0717aed1247	Consent Required	6325ed20-8593-447d-95ca-17e4271cc794	consent-required	org.keycloak.services.clientregistration.policy.ClientRegistrationPolicy	6325ed20-8593-447d-95ca-17e4271cc794	anonymous
8241ba68-a784-47de-9f0a-e7d4313d71df	Full Scope Disabled	6325ed20-8593-447d-95ca-17e4271cc794	scope	org.keycloak.services.clientregistration.policy.ClientRegistrationPolicy	6325ed20-8593-447d-95ca-17e4271cc794	anonymous
ebd0706c-aca6-4f30-9114-12bb892163c1	Max Clients Limit	6325ed20-8593-447d-95ca-17e4271cc794	max-clients	org.keycloak.services.clientregistration.policy.ClientRegistrationPolicy	6325ed20-8593-447d-95ca-17e4271cc794	anonymous
bb6bce28-1380-47d8-b27d-1ec015fdc101	Allowed Protocol Mapper Types	6325ed20-8593-447d-95ca-17e4271cc794	allowed-protocol-mappers	org.keycloak.services.clientregistration.policy.ClientRegistrationPolicy	6325ed20-8593-447d-95ca-17e4271cc794	anonymous
33752652-eb68-4dd4-b2ab-a0845bcfcafe	Allowed Client Scopes	6325ed20-8593-447d-95ca-17e4271cc794	allowed-client-templates	org.keycloak.services.clientregistration.policy.ClientRegistrationPolicy	6325ed20-8593-447d-95ca-17e4271cc794	anonymous
cefe9578-4f69-41ec-b2a0-dd1b5d0be5c3	Allowed Registration Web Origins	6325ed20-8593-447d-95ca-17e4271cc794	registration-web-origins	org.keycloak.services.clientregistration.policy.ClientRegistrationPolicy	6325ed20-8593-447d-95ca-17e4271cc794	anonymous
24412927-d385-41df-9fa0-eaed4ac326be	Allowed Protocol Mapper Types	6325ed20-8593-447d-95ca-17e4271cc794	allowed-protocol-mappers	org.keycloak.services.clientregistration.policy.ClientRegistrationPolicy	6325ed20-8593-447d-95ca-17e4271cc794	authenticated
b6dae87b-73ab-4020-be3b-987c3dbd5567	Allowed Client Scopes	6325ed20-8593-447d-95ca-17e4271cc794	allowed-client-templates	org.keycloak.services.clientregistration.policy.ClientRegistrationPolicy	6325ed20-8593-447d-95ca-17e4271cc794	authenticated
33f3e6f6-8f09-493e-9833-2ae437b2cb4e	Allowed Registration Web Origins	6325ed20-8593-447d-95ca-17e4271cc794	registration-web-origins	org.keycloak.services.clientregistration.policy.ClientRegistrationPolicy	6325ed20-8593-447d-95ca-17e4271cc794	authenticated
01400462-33b6-43b5-9d0e-798c5ffc70c9	rsa-generated	6325ed20-8593-447d-95ca-17e4271cc794	rsa-generated	org.keycloak.keys.KeyProvider	6325ed20-8593-447d-95ca-17e4271cc794	\N
5d71c8b5-7734-452a-9796-401cdce9bc5e	rsa-enc-generated	6325ed20-8593-447d-95ca-17e4271cc794	rsa-enc-generated	org.keycloak.keys.KeyProvider	6325ed20-8593-447d-95ca-17e4271cc794	\N
ba2aeee3-de5e-43dd-a697-2d5295264363	hmac-generated-hs512	6325ed20-8593-447d-95ca-17e4271cc794	hmac-generated	org.keycloak.keys.KeyProvider	6325ed20-8593-447d-95ca-17e4271cc794	\N
a34decfc-5ccc-408c-bb7f-7f875357d860	aes-generated	6325ed20-8593-447d-95ca-17e4271cc794	aes-generated	org.keycloak.keys.KeyProvider	6325ed20-8593-447d-95ca-17e4271cc794	\N
861071f6-0b26-4e11-b9bf-9b6b1bccfc62	\N	6325ed20-8593-447d-95ca-17e4271cc794	declarative-user-profile	org.keycloak.userprofile.UserProfileProvider	6325ed20-8593-447d-95ca-17e4271cc794	\N
485d8119-9464-4f0d-a15e-0a518cfa1652	rsa-generated	5139da68-ccba-407f-a23e-8551400f5c1c	rsa-generated	org.keycloak.keys.KeyProvider	5139da68-ccba-407f-a23e-8551400f5c1c	\N
47ae2d16-cd4b-4320-88e6-844c103fa42e	rsa-enc-generated	5139da68-ccba-407f-a23e-8551400f5c1c	rsa-enc-generated	org.keycloak.keys.KeyProvider	5139da68-ccba-407f-a23e-8551400f5c1c	\N
96404d2f-2774-4eea-a2a0-34572e7c24e3	hmac-generated-hs512	5139da68-ccba-407f-a23e-8551400f5c1c	hmac-generated	org.keycloak.keys.KeyProvider	5139da68-ccba-407f-a23e-8551400f5c1c	\N
9824f838-bb0b-44b1-a039-5c910b49894f	aes-generated	5139da68-ccba-407f-a23e-8551400f5c1c	aes-generated	org.keycloak.keys.KeyProvider	5139da68-ccba-407f-a23e-8551400f5c1c	\N
25b5a423-2838-418c-9a70-525f06b2d619	Trusted Hosts	5139da68-ccba-407f-a23e-8551400f5c1c	trusted-hosts	org.keycloak.services.clientregistration.policy.ClientRegistrationPolicy	5139da68-ccba-407f-a23e-8551400f5c1c	anonymous
cff50c1a-c611-4936-a297-e1f93a0314e3	Consent Required	5139da68-ccba-407f-a23e-8551400f5c1c	consent-required	org.keycloak.services.clientregistration.policy.ClientRegistrationPolicy	5139da68-ccba-407f-a23e-8551400f5c1c	anonymous
197c58b1-ad58-4443-9058-8aa8e5866c28	Full Scope Disabled	5139da68-ccba-407f-a23e-8551400f5c1c	scope	org.keycloak.services.clientregistration.policy.ClientRegistrationPolicy	5139da68-ccba-407f-a23e-8551400f5c1c	anonymous
adaa2a46-4014-421b-bec8-c1b3ffd47035	Max Clients Limit	5139da68-ccba-407f-a23e-8551400f5c1c	max-clients	org.keycloak.services.clientregistration.policy.ClientRegistrationPolicy	5139da68-ccba-407f-a23e-8551400f5c1c	anonymous
23b9d5a6-be81-43fa-8252-14a81d79b08d	Allowed Protocol Mapper Types	5139da68-ccba-407f-a23e-8551400f5c1c	allowed-protocol-mappers	org.keycloak.services.clientregistration.policy.ClientRegistrationPolicy	5139da68-ccba-407f-a23e-8551400f5c1c	anonymous
915a31be-ea17-4176-ad5f-c4cd9474fe7a	Allowed Client Scopes	5139da68-ccba-407f-a23e-8551400f5c1c	allowed-client-templates	org.keycloak.services.clientregistration.policy.ClientRegistrationPolicy	5139da68-ccba-407f-a23e-8551400f5c1c	anonymous
ccae8c4f-9440-45ae-b645-8e55e12e73b9	Allowed Registration Web Origins	5139da68-ccba-407f-a23e-8551400f5c1c	registration-web-origins	org.keycloak.services.clientregistration.policy.ClientRegistrationPolicy	5139da68-ccba-407f-a23e-8551400f5c1c	anonymous
0a185b2a-1e6b-4c4c-9f7b-8d839d5b7d62	Allowed Protocol Mapper Types	5139da68-ccba-407f-a23e-8551400f5c1c	allowed-protocol-mappers	org.keycloak.services.clientregistration.policy.ClientRegistrationPolicy	5139da68-ccba-407f-a23e-8551400f5c1c	authenticated
f9551a7f-d4d5-4691-956a-572f0d28148f	Allowed Client Scopes	5139da68-ccba-407f-a23e-8551400f5c1c	allowed-client-templates	org.keycloak.services.clientregistration.policy.ClientRegistrationPolicy	5139da68-ccba-407f-a23e-8551400f5c1c	authenticated
24c43673-3014-4330-91ec-f30672892705	Allowed Registration Web Origins	5139da68-ccba-407f-a23e-8551400f5c1c	registration-web-origins	org.keycloak.services.clientregistration.policy.ClientRegistrationPolicy	5139da68-ccba-407f-a23e-8551400f5c1c	authenticated
\.


-- ============================================================================
-- Data for table: component_config
-- ============================================================================

COPY public.component_config (id, component_id, name, value) FROM stdin;
66280171-683f-4930-8e1e-ae2c76ded5e6	eae611ac-a84d-4f92-a24e-1711cacef9e3	host-sending-registration-request-must-match	true
5bd386ab-3d75-4c70-8ca4-ebf2fa1174fd	eae611ac-a84d-4f92-a24e-1711cacef9e3	client-uris-must-match	true
beaec482-7494-4be3-9924-3abf2a18f3ea	b6dae87b-73ab-4020-be3b-987c3dbd5567	allow-default-scopes	true
15f9355f-48b2-4526-9053-2442aa802dcc	bb6bce28-1380-47d8-b27d-1ec015fdc101	allowed-protocol-mapper-types	saml-user-property-mapper
6e884147-634b-4def-911b-454b80f44c64	bb6bce28-1380-47d8-b27d-1ec015fdc101	allowed-protocol-mapper-types	oidc-address-mapper
00e5dd9a-90cf-4ae8-a9d9-5f76a9afd443	bb6bce28-1380-47d8-b27d-1ec015fdc101	allowed-protocol-mapper-types	saml-user-attribute-mapper
ddc58939-5a45-4dfa-b6dc-9d3dd7c65b2b	bb6bce28-1380-47d8-b27d-1ec015fdc101	allowed-protocol-mapper-types	oidc-sha256-pairwise-sub-mapper
485be4de-c097-4df7-8f73-ae110df5b4b2	bb6bce28-1380-47d8-b27d-1ec015fdc101	allowed-protocol-mapper-types	oidc-full-name-mapper
72a398e0-0d58-4235-a385-434515f483f3	bb6bce28-1380-47d8-b27d-1ec015fdc101	allowed-protocol-mapper-types	oidc-usermodel-attribute-mapper
4aeb8e49-a9c8-4cae-b04c-1a1983d19ec7	bb6bce28-1380-47d8-b27d-1ec015fdc101	allowed-protocol-mapper-types	saml-role-list-mapper
b4167add-842b-48ce-a60a-fd32a9c98b42	bb6bce28-1380-47d8-b27d-1ec015fdc101	allowed-protocol-mapper-types	oidc-usermodel-property-mapper
c845ccca-f7ce-412a-b9d9-3c338e359c9b	24412927-d385-41df-9fa0-eaed4ac326be	allowed-protocol-mapper-types	oidc-full-name-mapper
9a6fbba3-88e6-46fa-a850-23d72b3ace43	24412927-d385-41df-9fa0-eaed4ac326be	allowed-protocol-mapper-types	oidc-usermodel-property-mapper
25a18979-6f1e-4c43-bd65-2c275fea8598	24412927-d385-41df-9fa0-eaed4ac326be	allowed-protocol-mapper-types	oidc-sha256-pairwise-sub-mapper
d7cbe12a-d457-4422-a058-b415b2eb1626	24412927-d385-41df-9fa0-eaed4ac326be	allowed-protocol-mapper-types	oidc-address-mapper
d5e95dd5-231d-4337-99ab-e100b5b02aa0	24412927-d385-41df-9fa0-eaed4ac326be	allowed-protocol-mapper-types	saml-user-property-mapper
ec6ebb94-1f73-409a-87e5-b46b1ccb895e	24412927-d385-41df-9fa0-eaed4ac326be	allowed-protocol-mapper-types	saml-user-attribute-mapper
99074bee-6f1e-45dd-8941-dcf8ed307485	24412927-d385-41df-9fa0-eaed4ac326be	allowed-protocol-mapper-types	saml-role-list-mapper
85cb36e9-22e4-4a23-b12a-ca09be259d2f	24412927-d385-41df-9fa0-eaed4ac326be	allowed-protocol-mapper-types	oidc-usermodel-attribute-mapper
a3867457-d73d-4f9d-99dd-5ed2bbd97a90	33752652-eb68-4dd4-b2ab-a0845bcfcafe	allow-default-scopes	true
c5425c29-e026-4aae-a8c3-d71d1938e2b1	ebd0706c-aca6-4f30-9114-12bb892163c1	max-clients	200
29894617-9d2a-4173-be89-4684566e07da	861071f6-0b26-4e11-b9bf-9b6b1bccfc62	kc.user.profile.config	{"attributes":[{"name":"username","displayName":"${username}","validations":{"length":{"min":3,"max":255},"username-prohibited-characters":{},"up-username-not-idn-homograph":{}},"permissions":{"view":["admin","user"],"edit":["admin","user"]},"multivalued":false},{"name":"email","displayName":"${email}","validations":{"email":{},"length":{"max":255}},"permissions":{"view":["admin","user"],"edit":["admin","user"]},"multivalued":false},{"name":"firstName","displayName":"${firstName}","validations":{"length":{"max":255},"person-name-prohibited-characters":{}},"permissions":{"view":["admin","user"],"edit":["admin","user"]},"multivalued":false},{"name":"lastName","displayName":"${lastName}","validations":{"length":{"max":255},"person-name-prohibited-characters":{}},"permissions":{"view":["admin","user"],"edit":["admin","user"]},"multivalued":false}],"groups":[{"name":"user-metadata","displayHeader":"User metadata","displayDescription":"Attributes, which refer to user metadata"}]}
ac470f64-3b98-41c8-9cd7-beb6a7ce8dfc	01400462-33b6-43b5-9d0e-798c5ffc70c9	priority	100
0db1d1a9-db2d-41ed-a76a-002ddb9f2dda	01400462-33b6-43b5-9d0e-798c5ffc70c9	privateKey	MIIEowIBAAKCAQEA4DsFIFqEDmzROSJY4KuiGC5/xsk1aEIvOispSTZJG6cn4wwK9SrXN6qym3bC2ZbaYec66ktMySSGtk2aRyrQoDoBDxeLWBNAKDcquN9vd4fueDTiojyQ500MLRhg6It+2QLNBvEX+q00yDCmX0069tfvYO54CBk/15/yDlMR8Lzz4KBNJtW/NtAOau1n2NRCOrdjiHg4jGDHxX7XMlyKdQ1MFNcxLsB79O/UAnHGaCIPcwB8NZlWa0EoN75TnV9S/mZPYS7glI6gsCKZkpkpr3e9w65Bxm1QBaM16pMmzsWgyzFZxEw3QIJnUyebZ/aT6ZR9YLR4SnbgkwyGP1/XTQIDAQABAoIBAChxNK4+bSF96mmD4qRZCHIUluq3WSjeAQ8cgESKZDq21hibEDHiYXFSmga0r5WXofk0/5kI7kc8DYj9a6VI2VqAw7ahYDpJNJHcS1oPQJc+PtpS7Ypl4pu5N4g9pKLkoAMLgIevPcwyZ7nwnl1DfG5PiYcB08fgJ/XfzQRc4rg4wdVMGgi3p2j2cy9AE/k5z6Xc+guhRayIi2JVsVsKlQ0pWhRMieUs2+Fzxugq2cCbqI+9sc+DdQgh4vFNPwNMn/mlbsPXP9SdSlKnVtbRkkQZxCusF462xqJYc+0xhVdkp9AdoGURK+ocE8uEhemczFW683b0zHkBXYBbb0seSAECgYEA8RMv1pY1GkTfcd6OviARj/SPBZg8UweKtcqzETuGDjGzR7Kv9XYup3ZUS4/fm5F6zCzkaLD7XemKrO11PJoeZxP/T5sfYRNe0Aonw7+IHnNs6DsIw22MV7uE1JwNedrbFwr9ursLKwrH/Y4RQ8SLDnvUkU387eRu/D114gNuGAECgYEA7hzddv8h0bbrjoEc5liT5Y+teNcnICfyYlUg+IOEX5rH2ADf+wIm2bOxVEOv6+FcEZ7IIpZauPHWNWWEGxmBAv82Rsn2yy9njXeczCafxaOZIAQfVylkck/jedjiQv/h08QDxKmMDIMtLJnV1LFTO7G87d4HXgEhgeqtJWZan00CgYAPlAjUWhKGZwr1Zcddm97mqYwQdXz4dJVPGBEoPOt1wVpveKmMOB3drnTWCS8O84C27vO3nDAyKmROtm2MA/2Q9aba8xA9Cq5mzTEyog7ewOC5xQ7U6iBWjwSPZKIuTKk5vPkWdv3Kw0CXLvYIpgvCXNgop5x/lvJhFGuotkYIAQKBgQCdCk6Jx9SvMnwC3WaJCQxpz6uyUfwM+iui7NA09tBcGYIKFPGj45Rp6lhe4dFpuZT2TglivlUROvZy+wP4t4ZdyqIqZ9MryJT8OVIhVqvzNmWsNuvQmY0U01mMqBz54Tc4akOt9cBXFEC79K2RfG4PpbacDt4/AnHt9C/DxdCo1QKBgE9qpT2ep9s1YosoBLlO9Y2IRrUUIcnH0ueTSolxWX0IpopftieghGyyj4AbaAcSAzwWl7L8zwvOzgdDORCBhVSuoXvYSVnS6392ES4Zbj1eYhfCObuVElk+41qHezvVKaAkTEaLOMcQZihuQ94PS9uLw+9507Qitmy4ERBMLTxI
eab7f4c9-79b8-419b-92ef-aedf045e0bf9	01400462-33b6-43b5-9d0e-798c5ffc70c9	keyUse	SIG
e079257f-6c72-420c-a74b-27bb52ca5de0	01400462-33b6-43b5-9d0e-798c5ffc70c9	certificate	MIICmzCCAYMCBgGcPe+KHzANBgkqhkiG9w0BAQsFADARMQ8wDQYDVQQDDAZtYXN0ZXIwHhcNMjYwMjA4MTU0NTM0WhcNMzYwMjA4MTU0NzE0WjARMQ8wDQYDVQQDDAZtYXN0ZXIwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQDgOwUgWoQObNE5Iljgq6IYLn/GyTVoQi86KylJNkkbpyfjDAr1Ktc3qrKbdsLZltph5zrqS0zJJIa2TZpHKtCgOgEPF4tYE0AoNyq43293h+54NOKiPJDnTQwtGGDoi37ZAs0G8Rf6rTTIMKZfTTr21+9g7ngIGT/Xn/IOUxHwvPPgoE0m1b820A5q7WfY1EI6t2OIeDiMYMfFftcyXIp1DUwU1zEuwHv079QCccZoIg9zAHw1mVZrQSg3vlOdX1L+Zk9hLuCUjqCwIpmSmSmvd73DrkHGbVAFozXqkybOxaDLMVnETDdAgmdTJ5tn9pPplH1gtHhKduCTDIY/X9dNAgMBAAEwDQYJKoZIhvcNAQELBQADggEBAN8YY0OyYaBjnJt8bqddodunqPukT+9u2uImsAYwRNlfu+JuhOouC+XQWwdlRuUf+pr1TsSndnOnAw8QZR/ByQHhdDQL9yPLDcGOMKtb78IHnh1GMPg4wVQhjih+klqgZG9OtQ6IK9qpHSBjkTHYKAf/FinHbPSdAj6JPl5P5y6Ez/YPXePL61hZH68apecmVnSOOe1l/7MYwneFRnUDrew907BZ1PLEsP69CjTL+b6HrfbrwQCC/gG2rbVglKxOF903HURL0PSkmvk2OPaA3XYzDy2NP/ciPRXg6JAyOoGWBMfJgmUR/kVXKrIOs8W4W+LPO9RKBNQdAZl1yxiwx/8=
9232d900-062d-4bc1-b4cc-72f58dc9e742	a34decfc-5ccc-408c-bb7f-7f875357d860	kid	7d936ca3-6fcf-4d2a-b437-a0d9886202bf
a2a080da-6903-4056-9f60-9986ea621fb4	a34decfc-5ccc-408c-bb7f-7f875357d860	secret	R2nf1MwVpfu0dv3PI4lBqg
aac16cb9-3b99-4eea-94b8-fe790b693ca0	a34decfc-5ccc-408c-bb7f-7f875357d860	priority	100
cc6144ce-d2fd-46f9-bc4b-79e8ec761194	5d71c8b5-7734-452a-9796-401cdce9bc5e	algorithm	RSA-OAEP
fcc05e08-d905-456c-bcba-332503feb1d7	5d71c8b5-7734-452a-9796-401cdce9bc5e	priority	100
b09fface-e3ab-49ae-879d-1a691c8c2647	5d71c8b5-7734-452a-9796-401cdce9bc5e	certificate	MIICmzCCAYMCBgGcPe+LADANBgkqhkiG9w0BAQsFADARMQ8wDQYDVQQDDAZtYXN0ZXIwHhcNMjYwMjA4MTU0NTM0WhcNMzYwMjA4MTU0NzE0WjARMQ8wDQYDVQQDDAZtYXN0ZXIwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQDNZoLscASM/EAM2JQL816RqR0WfBbYpDKvhNg1QJr0xlvkDnwxl3eNfMhdyUqzXwNhPm6igWOhAu3/4lx4g075fUFWKTM21Lc+ovuuBKet9OEHWylTSUWwayljPw6K4612Sk6btX37fxDc/rQEnP/MbG5W8c81vv9NhfO7jVFzdOPT8v/u13pneQ+rEP6USFMueLhpqq8eLxRJVNGTy/rvxo09WvmgQ+kBZpBEO0+ylvoGEOSFBLnHqXJCTJxR7dR4u+CUpFNwbiG693q/heWuhojA1SztyIYtRdN2n/9llSXyprmexu3edFsv4wHaz9qSmxsgB3dv6XFGjV7Bt9b5AgMBAAEwDQYJKoZIhvcNAQELBQADggEBAEv+hWBUZ2pYDrujrtGA8Sh5venDqRdj7CfhrIO7A3ZGMvNBS33aerjd47WLzJ3gMFsVxFXsaj60NsvNa20rLildOBTTrgusuNsi8i0ixEEgdGt3DCaivj52w6wKW5ZIpUThOmbpw/VaURbAiMaoDpxWhC3Yay4IYtU5sDx8YonbYOK3KQ5rswvnfX1Kn/npz2xVbK4EGfpIPiDMnQcyT1eOqQzxrjw7Q72AsWmjFkmLMy9+hyFTsUMQudNsf0huR7KmGO3ihTAwP3rRx7q6ZUYRF8863+bthTu8NI8RDpEjCocUuai2tNA76WlwtYa1az0/sHzGbGI0NYeHb3n3+UQ=
9687469d-b9e0-45a0-bdf8-17d9fbafb0cb	5d71c8b5-7734-452a-9796-401cdce9bc5e	keyUse	ENC
9b34b4d9-646a-43aa-b0a6-934de6af2e49	5d71c8b5-7734-452a-9796-401cdce9bc5e	privateKey	MIIEowIBAAKCAQEAzWaC7HAEjPxADNiUC/NekakdFnwW2KQyr4TYNUCa9MZb5A58MZd3jXzIXclKs18DYT5uooFjoQLt/+JceINO+X1BVikzNtS3PqL7rgSnrfThB1spU0lFsGspYz8OiuOtdkpOm7V9+38Q3P60BJz/zGxuVvHPNb7/TYXzu41Rc3Tj0/L/7td6Z3kPqxD+lEhTLni4aaqvHi8USVTRk8v678aNPVr5oEPpAWaQRDtPspb6BhDkhQS5x6lyQkycUe3UeLvglKRTcG4huvd6v4XlroaIwNUs7ciGLUXTdp//ZZUl8qa5nsbt3nRbL+MB2s/akpsbIAd3b+lxRo1ewbfW+QIDAQABAoIBAAP1WMqTshLBfb6BogDE9OqbtrrLM2mDaJKnXb9Q+muDMxwnB0+xWpV4dSgRjAX+68LBAELTeYcN1mZbB2svJKN8PXkanCkPWmSzoWQOJOkeUgPhRt+bBuPKfOazvWUB1EL2VaN8kOv62+lWY0O/ftKCuHGmgVbI0oS88yCHLa2q5yiG/bDjAvRXyFZhadpGwf0+2UJCvPBmmfo/SYf0QkNwC7ZoroVCjwxPDWtqOImed6xOLU88/ljpl/RCMz74YAaBf7sTSG3mxQgOp6hM3gt6Nv9DOaH6ciWnAunMCnIdkgmBgj2sGdld1S1DPiE3n/Vd4YArMoVaCBBMBVCNhk0CgYEA9ox/9/RtPJ05V7OsD8s8zbqZT3OW+Q5Ky+P8lAGPhu94ZgFb/NyMRbc6/q7zn8iz1K8JfRH2aUwyJ5h+xMYpKIbriKBJ5sFHJnEhbGJXS1fya7ch0urq7CpxvlMEvQdjtT+rqy4ydD7gaXF0LQKCveAUtfZ6l9oTiMfSsRN+kg8CgYEA1UYz8yAtD4EhYS5f0XU1oJzZbgGhjhqGXBZxnzhIkg+lr43Nv1xUDbrYuQNqJ4jL+tIX5nQCCL+VHUpOCzKpGz8iyo/QscPJWfsNcuiHG/2/MM4QaJBUJqjNE45vOdK83IQMVifyayMwg92P/k21qmF7EkBQIPGLB9iBMVBo7ncCgYEAs98bOYYs7+zwuehOXpNy/9DkKs/01C02KnxheIWO9e3d0+Wn+9nXyMD+HHL9MJSXhlJRRNsHABlj+flKezrrKjMMwXfXkq9tvkEJFm7EqyY1qZpI5f0XeUcaBrXAnjw25TPXhaLFkoOQ67ym+nN7eRVzZrG1DPZADClksGW9kMcCgYBm60vihaJ5Gu2KwiBHKfLJISfj6DGYK8Cu673FAhozMg3Ym+uv7tQ5E/PFxJoTnfYhggU6lrzsj9dbnSHwUXA9z8fwTFp/jmW6YGZrDz80CM2ctbRBYXTaexcL2u5dzw6Is8hoQzq+7OpamC8Gn2WNZSFI+3QvkaBwFtCxhYY9nQKBgHutKLuivxGV8zJyj3RR8GZVwF13cIBYt0DLWWOVY0nDU6YWR8nWac2xIfMnfvmbwt5H6Yw+66DzzD+k18+mdyPqostMfdXpnNqXiji3jeqNiKFoFSz2r5qUf/pVj16QXg7ZT0C36jEe65xObmgyJ/1h1QJlu5FR0tFbiTWD096e
7218b599-e6c3-4f79-bd25-75049e00764a	ba2aeee3-de5e-43dd-a697-2d5295264363	kid	6f596c42-9d5c-49e9-a988-54a1cd4dcf17
87c7798f-6486-4cd5-86bc-a6f3e62357eb	ba2aeee3-de5e-43dd-a697-2d5295264363	secret	eiKrkpxbxY29wLT6c6JSDMq6pij5ui6mtdpnixg6606MQCUMf0SvG_5P4yYObq6knuzpEN34whvXa3q5spMxVBOfzHKKb-qxETiIn6OpLAOspJG9XgmBQE0UwBDMYv-uDwli74r_qo52Hfd4djqQZVFk8HXWfNjv2ew3Y2_nM9I
4643185a-c6d1-4361-9225-d2ab6a4e6e07	ba2aeee3-de5e-43dd-a697-2d5295264363	algorithm	HS512
2e5e210b-44e8-4b0b-904a-f99ce2a6ca2a	ba2aeee3-de5e-43dd-a697-2d5295264363	priority	100
1204e277-d5ed-46ba-a24d-94e2ee8fc895	47ae2d16-cd4b-4320-88e6-844c103fa42e	privateKey	MIIEpAIBAAKCAQEAnROu8v8fhM8FEvIKueZ4oTnU7Iocr2p2/7wRSogK9R2FcAgiFzMEc3KCmdtju8z+fDn+gix6kkl/7B70tR8I3zxu13w8JoyKyeFq6xt2zmKTR9eEnFjn47fte9Jk+W3hyaCE9O+r989sZIt8/KwHsdXpvRcj51Fq4J0gqo8D4NqP6ZObx38PI3gOaEZx6jW0G8q93I9RGAxdJCNjqic5pscxRvC22I6bEWQGGPfu+MuUTYCXQaS+uxUJIGbWHTFGBQttaQa+f2v/XpzAa15+hbN50j1N3cwhwzc+slJcgiQJ+XTgYjp7jHDoKRXcdgWoVHtnMiLXR/3e5vlm+EZxLQIDAQABAoIBACaKPdLBZipf4Q7U9GzIb7CfT+75tDAWHzyAGH4BAy9BHwxt8m9exSjOX90AR2g80/QHBrtJzok2H3z/22rVQogDe+7DPL74nNULygAFrRDWfuyRpKf36G2nI03OQZgxrcSa7gRrCfaznhTNZM1aKEkqAz+x/c0z3NVfuDQhAwKYOxWckpQxx8HbXI+lwUSSURD27b88/nNMiJ0IuSf4XCOm6XXNxsQlXZnKhgvM8XNQS8HxfwGFXCIPJZFabUMJMfiyJ7npZUUowbVuLStp/XuAK8JSH9UxlCZHfeucSisCCR4n2wIX+9rxkR+Z1i2hKp+GXN7ppJa4OecW+ExgqsECgYEA2jzLecZkvSPKLUPCaOPm4NDyF9KeZxdgxofA02hVbZpNG9y2yfnwRQh4ElCPLvDLiP9qmrJASB2MpZCCtmn1yhBnUw/zLVYHN7kxaEOJzN35mzh6AIY9zJaEOIkbBA4kKwFWv/AxOBg1DIIaKQPlmDH8KAEYdivz+0mDkEYWMDMCgYEAuEGsvyiEGKCd210HNGsfW0OWL34uFc+Wgtg5dDnmHBinucQHi0dfZA7n4RZOz9H4asqw2FdIexUTF+Z/h2oF6XU2TyOQ58qquGQ2EK31KEUvLsy96yfmUbzxnrFVDndfEqz1OYFFqpJVI3dt+yjm33iUMRj+GMLvYz5u+IV3+R8CgYEAh1IdJUQ0YOdZTNnwKVPvbEWDZ+wsVmYzlsbEdRIDrrN3zqf8G59EMbn/ofOb5RJgUnF167hNjans9Rh3RJ7NTl7/goyoT9tBHHdTwH/oaUTWqj3JwJt8pGhMUjYJr2kJWjU5UkigbFTuR/RAPmBxM/8CiNetEFFOtuktj/81cOsCgYAfhnUU+8ymHg0ENEWATXe++LBgjdk6uBrLZk1mOmXJltpTqVuVE/AZQYeg9l0jp4w2UVmymjR3gqKSq0hUlepPCFPzdGVdk0pkZBjv/6N7cWLiQfuYmWoJwCci/LpN0FS+8ELAxQJzbbgNamix2UyvHYVVZS5MdEXbGBqKgOOHBwKBgQCXqC7Rcjsk4uLTRP0y6naDdSz7Jud3zEpQ2hj7Ib25qI9kPRwS7xj+zEkjFMBUF+BqDRGl9GDVoSkOU1oJoaloVQqds/vce4KlL4RvgQ5MLYzXjPfvkkXcf0MNdkiuTm2MiR79eNSEzR/iXmi81AqfLxb71v3Sn96y754e3BjpGA==
269f9e5b-8fad-4815-b3c5-d3016164b5e1	47ae2d16-cd4b-4320-88e6-844c103fa42e	keyUse	ENC
da2a532d-525e-4f20-8d42-cad200116c95	47ae2d16-cd4b-4320-88e6-844c103fa42e	algorithm	RSA-OAEP
d6c8f329-9a4b-4218-91ce-425d312830ca	47ae2d16-cd4b-4320-88e6-844c103fa42e	certificate	MIICnTCCAYUCBgGcPl+NLTANBgkqhkiG9w0BAQsFADASMRAwDgYDVQQDDAdhdGh5cGVyMB4XDTI2MDIwODE3NDc1NVoXDTM2MDIwODE3NDkzNVowEjEQMA4GA1UEAwwHYXRoeXBlcjCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAJ0TrvL/H4TPBRLyCrnmeKE51OyKHK9qdv+8EUqICvUdhXAIIhczBHNygpnbY7vM/nw5/oIsepJJf+we9LUfCN88btd8PCaMisnhausbds5ik0fXhJxY5+O37XvSZPlt4cmghPTvq/fPbGSLfPysB7HV6b0XI+dRauCdIKqPA+Daj+mTm8d/DyN4DmhGceo1tBvKvdyPURgMXSQjY6onOabHMUbwttiOmxFkBhj37vjLlE2Al0GkvrsVCSBm1h0xRgULbWkGvn9r/16cwGtefoWzedI9Td3MIcM3PrJSXIIkCfl04GI6e4xw6CkV3HYFqFR7ZzIi10f93ub5ZvhGcS0CAwEAATANBgkqhkiG9w0BAQsFAAOCAQEAHOk3o0ePjfeJMbTpStfRHOMGK6nd3H6uV8EsK8X2idXrtwqMTyF1HyUfvNcbpFt7G+jtzyrRYHjx52qSMBcaT4jzRvwwGpjWnCL99JaFkWtmLGgoTNwlZGKtmK9DuxBk5qdwEFbExO3j7qi+mRuSL1YeaHg2n9Va2azdZXV7rXUAWQ4LaSoQ26j4q3BatwSVtHWVWzFfYNtw46qBnhpC4ZciAIqnwFVE2YdCULg7yumS4C5Fc96gbQlicSxOLoIHbrjIx6+nF8Zyi93utHpR3ms5qJhTJ8+0yRRxO1CHg9Q9f3/nAxWwgicQC5dWCvIFM62CyOrAHRwsfPhgI8c21w==
cc11c85a-9df8-45c5-bcfb-72d7e1aafee6	47ae2d16-cd4b-4320-88e6-844c103fa42e	priority	100
7eba17fb-f9a2-427b-9062-377b4419a0ce	485d8119-9464-4f0d-a15e-0a518cfa1652	priority	100
35a08be1-9284-4d67-a1ad-b0e159b2b457	485d8119-9464-4f0d-a15e-0a518cfa1652	certificate	MIICnTCCAYUCBgGcPl+MUjANBgkqhkiG9w0BAQsFADASMRAwDgYDVQQDDAdhdGh5cGVyMB4XDTI2MDIwODE3NDc1NVoXDTM2MDIwODE3NDkzNVowEjEQMA4GA1UEAwwHYXRoeXBlcjCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAM/Hx1KUDv6SFhtSnLdV+KL/kyZ3xwhy9Q37kaTFDnURGK03BzxXc/r524sCyrsz5nngzJX/vnVk+AiGQ9VtfWKWww4p4K29IA9UuJFKRz0Rhsnwp4KQj0h9F/sBwc/yPYBM/9R2yMQuj/A3LU/ycBvTDOiuJ6jlvCha3c4sRahop1sYnai6v9zQnWYXpZ/Yx5rIETwRTu8zUruxgnnmr/8Xe1bqXUkh79lcR9wTU85pRyHmZnljCMwFYKwP1tWWepcJ4RYhlnhvRrmheJCK/26fNNNNdbVDJnhG4Gi2sJneeV23XbSobdL+hfL43d8nj+uJ/zxjNUygQ4g5eVeRa5MCAwEAATANBgkqhkiG9w0BAQsFAAOCAQEAk4W2yEEHz8rjarE5cwCeodpP56bUma4mUZFqcjLU/mn2ICsm/D2KwA/HjB8DXrIEJXu+eZRUSwUrri/o0wggJuBKfKp1dQ5L29fMtd+MKI/vuUxT6Mn/3IjQAa7XiWpFn9IkzkwtlOcNhfFFnFOtzYeLdS8QP/nB4piBcSuizEGolaNHii3qCp4xakhcUTUSrhnbUxrQKUaGS9XhwsblGbX7Ov28U/oEXnyn/DvB3Uw+wBp4zUfLXVo5FBQiBRmuZq4OU3CQpmSCaD6L42ivfZ18FRSiLXswh/GXAamJABdqYZcKQd7FXLgLDz0V9ABRxLMBPzLVfFpe1y2zvwvBlA==
32cf3ef6-b9bc-443b-8190-160fc3fcf842	485d8119-9464-4f0d-a15e-0a518cfa1652	privateKey	MIIEpAIBAAKCAQEAz8fHUpQO/pIWG1Kct1X4ov+TJnfHCHL1DfuRpMUOdREYrTcHPFdz+vnbiwLKuzPmeeDMlf++dWT4CIZD1W19YpbDDingrb0gD1S4kUpHPRGGyfCngpCPSH0X+wHBz/I9gEz/1HbIxC6P8DctT/JwG9MM6K4nqOW8KFrdzixFqGinWxidqLq/3NCdZheln9jHmsgRPBFO7zNSu7GCeeav/xd7VupdSSHv2VxH3BNTzmlHIeZmeWMIzAVgrA/W1ZZ6lwnhFiGWeG9GuaF4kIr/bp800011tUMmeEbgaLawmd55XbddtKht0v6F8vjd3yeP64n/PGM1TKBDiDl5V5FrkwIDAQABAoIBAEe+xnsjp7fMbri5gmal12hFEqT+R+oJc8eDvcskxfSzVg99iFCUK/aV7vJloOYaKjOcZVhIChZUKncbEXIxT9HKmAicejnTq63PhbmZadbS5fV11Ql27BrOIwknlqo8jXLvY4kUCQgAwe/ixZEs9/wLmJIBjK07wog2tA8cZ2MaPJQs0Z5UpnfeDj6fmlqyLToU74eterxJgY/3GCQGSEtjGw0Xs5GO+ncZ+pmqaH5g9L5yM6QpsFAxNrCR9be4nHqHKSmk4CnEls/rTOi9djk2tr0TgB6GWvQJjytUlOSwDGGQ5EVBSiNgm0dXQym08nNChE3nLUwAWUgaEvJw4r0CgYEA7V4Yjr9AehhrSyHuEigazGKdjxKygWFvlZcZCeyA+iXcLnDoU+dRDwzK2FR7LjVM9KZpJGG8d4yUrf/OoDYVlpadaYF+V8Y+3Fve612qBGdirwG68xRB/+gmEHkPShv72i9U1n/MDnp11DwDXAZqbavYFls6qQXTjzVgkvyYEA0CgYEA4Bcgw/g1lwaer8ZVVWz6TpdAuap53SO9U4XGeQDlFOsVi4jSmc7XWrb9ZVRkogGCmT/34vFtVMniZD6dyBuJmWBGO9oY1ivJP6wSFOBzVq/qJmvaDKM0gTZuDYSVE7PdQkH1VxM40Ksorow4I4cSSE7U6QzUxoA3JdGKGdPs4h8CgYAXCQKpF7ZSIvyGlgxchrfTDd7se4wHMkV55ufvJpx9qh7sAtkJC3G6XCtzQv+RRGrrcxrRBQsdLu9e02xh7924d3VfP8nbCsoe6GuBu908ACx7f1d9L4IYK5dGEfmB36VZTy6UgmJzJT86EXjh/V1mtz6JLOFMddxKEYwFt62qIQKBgQDM0pbySGbDOhvFUiUhRdCsEPfqPHXSuR4Nv5Kfez/oFM/GkDLevv58PhHykmbA5Vx3ss5isoVaIIU7VzhkdTcZ57OKdViKOc9i0WZdiqIhs/zzTVUqg+ozyIpi9LJGJfqw2xTimAEwSaGPmT6eypDdYqCcu0uoe/zsJlByNxCnxQKBgQCRn/a29utqwfis0FY4iubvWjRLWoMldp1vGjsbxX6+nx71f5ZeM0/uFpj8ToR3afjDf28cscqewkXVT52x96NCTxqjw0x1l0OrVgXSTq6m5Lqz6h/ctFeFHfnyaaZC0gRSSls8sqaFM5vOXDIRxMMzTUWkWvqZqZTms1Hy1gw9cQ==
d96730ad-1a7c-4232-aa98-2398fbfb908a	485d8119-9464-4f0d-a15e-0a518cfa1652	keyUse	SIG
30d0fc62-2dd8-4e61-9009-1432d5107549	96404d2f-2774-4eea-a2a0-34572e7c24e3	priority	100
e44bf597-d406-4609-8c34-2cad0c226c5c	96404d2f-2774-4eea-a2a0-34572e7c24e3	kid	88e97ede-a8f3-40ca-9b10-49cd485fb077
cb3f050f-fc9a-448e-9d5e-3d0dd658cf67	96404d2f-2774-4eea-a2a0-34572e7c24e3	secret	r4Dw-5fvk3Fa7dYieILet_FJSkdm4wMeVDAdkUwNRyuldpuGZLJLSHPyn-Ae8ZQiSZVFOHTBlXVUBE19PMUwEks1Tyw28hmtAb0b3QLLWQlk6bG-jWK951loIVQmbipCm7gDecjGC8jKWRs1eiqANkTO_Liz6PLLSrtj0JzCVp4
061a6484-3a25-4141-84ed-edde60c0c29b	96404d2f-2774-4eea-a2a0-34572e7c24e3	algorithm	HS512
97d6c951-f433-468d-8205-31a1ef918fef	9824f838-bb0b-44b1-a039-5c910b49894f	secret	L-LZAdTklveZsAzFfMXAYA
aa328c4e-d8fe-41ed-ab65-24b74b6ed9b1	9824f838-bb0b-44b1-a039-5c910b49894f	kid	31369438-d35b-49fe-a710-7c07c1c6a55d
50f8fe57-9c41-4d30-b35d-484c5947af49	9824f838-bb0b-44b1-a039-5c910b49894f	priority	100
39e6582e-6a42-4d46-9643-97aa18d20eb7	25b5a423-2838-418c-9a70-525f06b2d619	host-sending-registration-request-must-match	true
809491e7-9d4d-41f0-84d2-443d33be65e6	25b5a423-2838-418c-9a70-525f06b2d619	client-uris-must-match	true
2b29f182-e813-4110-a011-faf9bf36f8bb	adaa2a46-4014-421b-bec8-c1b3ffd47035	max-clients	200
c2676441-ca12-48a4-9222-72402c199af0	23b9d5a6-be81-43fa-8252-14a81d79b08d	allowed-protocol-mapper-types	saml-user-attribute-mapper
4402bf6b-947a-4b6e-97d4-bf598fd34892	23b9d5a6-be81-43fa-8252-14a81d79b08d	allowed-protocol-mapper-types	oidc-usermodel-property-mapper
98311e45-9971-4652-a598-59495fc47b72	23b9d5a6-be81-43fa-8252-14a81d79b08d	allowed-protocol-mapper-types	oidc-address-mapper
02c63349-5dd5-4814-9297-ede2140cfc17	23b9d5a6-be81-43fa-8252-14a81d79b08d	allowed-protocol-mapper-types	saml-role-list-mapper
bfa2b515-2121-4530-87ad-2c362fa67e98	23b9d5a6-be81-43fa-8252-14a81d79b08d	allowed-protocol-mapper-types	saml-user-property-mapper
cb705de6-f9ac-4019-9a07-6716586602f1	23b9d5a6-be81-43fa-8252-14a81d79b08d	allowed-protocol-mapper-types	oidc-usermodel-attribute-mapper
1ed422ff-c2a2-4cbf-b34b-8e5f62a1d886	23b9d5a6-be81-43fa-8252-14a81d79b08d	allowed-protocol-mapper-types	oidc-full-name-mapper
86c86e68-a652-419e-9aaf-69696ed86e38	23b9d5a6-be81-43fa-8252-14a81d79b08d	allowed-protocol-mapper-types	oidc-sha256-pairwise-sub-mapper
3b0c6776-1193-47bb-8729-993325ed262d	915a31be-ea17-4176-ad5f-c4cd9474fe7a	allow-default-scopes	true
04b72198-2935-47a5-a2db-e9f591173fa7	0a185b2a-1e6b-4c4c-9f7b-8d839d5b7d62	allowed-protocol-mapper-types	oidc-sha256-pairwise-sub-mapper
b25faf5d-f008-4e30-88c6-f9c1739b46a9	0a185b2a-1e6b-4c4c-9f7b-8d839d5b7d62	allowed-protocol-mapper-types	oidc-usermodel-attribute-mapper
65c1bf0f-7752-493d-b29d-48473c0f8241	0a185b2a-1e6b-4c4c-9f7b-8d839d5b7d62	allowed-protocol-mapper-types	oidc-full-name-mapper
baafa7f1-129e-4d05-8b75-b04889c2a913	0a185b2a-1e6b-4c4c-9f7b-8d839d5b7d62	allowed-protocol-mapper-types	saml-user-property-mapper
eaf9fa8f-80e9-4090-a20f-bbd12354ff12	0a185b2a-1e6b-4c4c-9f7b-8d839d5b7d62	allowed-protocol-mapper-types	saml-user-attribute-mapper
a3e27681-1e87-4388-abdc-82dda682dd47	0a185b2a-1e6b-4c4c-9f7b-8d839d5b7d62	allowed-protocol-mapper-types	oidc-usermodel-property-mapper
58fda3dd-8d82-4834-a53b-b101f62cbe0c	0a185b2a-1e6b-4c4c-9f7b-8d839d5b7d62	allowed-protocol-mapper-types	oidc-address-mapper
2cc63dda-dfc2-4d3d-8dd9-fed2ad7d8f56	0a185b2a-1e6b-4c4c-9f7b-8d839d5b7d62	allowed-protocol-mapper-types	saml-role-list-mapper
460195c3-b879-4ee8-8d3f-40c8062ef268	f9551a7f-d4d5-4691-956a-572f0d28148f	allow-default-scopes	true
\.


COMMIT;
