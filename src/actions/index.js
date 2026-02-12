import { asApp, route } from "@forge/api";

export async function getProjectLead(payload) {
  console.log(`getProjectLead called with project=${payload.project}`);

  if (!payload.project) {
    throw new Error("Missing required input: project");
  }

  const response = await asApp().requestJira(route`/rest/api/3/project/${payload.project}`);
  const project = await response.json();
  if (!response.ok) {
    console.log(`Failed to fetch project (status=${response.status})`);
    throw new Error(`Failed to fetch project ${payload.project}: ${response.status}`);
  }

  const leadAccountId = project?.lead?.accountId;
  console.log(`Found project key=${project.key} name=${project.name} leadAccountId=${leadAccountId}`);

  if (!leadAccountId) {
    console.log("Project has no lead, returning empty email");
    return { email: "" };
  }

  const emailResponse = await asApp().requestJira(route`/rest/api/3/user/email?accountId=${leadAccountId}`);
  if (!emailResponse.ok) {
    console.log(`Failed to fetch lead email (status=${emailResponse.status}, accountId=${leadAccountId})`);
    throw new Error(`Failed to fetch email for account ${leadAccountId}: ${emailResponse.status}`);
  }

  const { email } = await emailResponse.json();
  if (!email) {
    console.log(`Email endpoint returned empty for accountId=${leadAccountId}`);
    return { email: "" };
  }

  console.log(`Resolved email=${email} for accountId=${leadAccountId}`);
  return { email };
}

export async function getProjectRoleMembers(payload) {
  const tag = "[getProjectRoleMembers]";
  console.log(`${tag} called with project=${payload.project} roleName=${payload.roleName}`);

  if (!payload.project) {
    throw new Error(`${tag} Missing required input: project`);
  }
  if (!payload.roleName) {
    throw new Error(`${tag} Missing required input: roleName`);
  }

  const projectResponse = await asApp().requestJira(route`/rest/api/3/project/${payload.project}`);
  const project = await projectResponse.json();
  if (!projectResponse.ok) {
    console.log(`${tag} Failed to fetch project (status=${projectResponse.status})`);
    throw new Error(`${tag} Failed to fetch project ${payload.project}: ${projectResponse.status}`);
  }
  console.log(`${tag} Found project key=${project.key} name=${project.name}`);

  const roleUrl = project.roles?.[payload.roleName];
  if (!roleUrl) {
    const available = Object.keys(project.roles || {}).join(", ");
    console.log(`${tag} Role "${payload.roleName}" not found. Available roles: ${available}`);
    return [];
  }

  const roleId = roleUrl.split("/").pop();
  console.log(`${tag} Resolved role "${payload.roleName}" to roleId=${roleId}`);

  const roleResponse = await asApp().requestJira(route`/rest/api/3/project/${payload.project}/role/${roleId}`);
  const role = await roleResponse.json();
  if (!roleResponse.ok) {
    console.log(`${tag} Failed to fetch role (status=${roleResponse.status})`);
    throw new Error(`${tag} Failed to fetch role ${roleId}: ${roleResponse.status}`);
  }

  const accountIds = (role.actors || [])
    .filter(actor => actor.actorUser?.accountId)
    .map(actor => actor.actorUser.accountId);
  console.log(`${tag} Found ${accountIds.length} user actors in role`);

  if (accountIds.length === 0) {
    console.log(`${tag} No user members in role, returning empty list`);
    return [];
  }

  const queryParams = new URLSearchParams();
  accountIds.forEach(id => queryParams.append("accountId", id));

  const emailResponse = await asApp().requestJira(route`/rest/api/3/user/email/bulk?${queryParams}`);
  const emailData = await emailResponse.json();
  if (!emailResponse.ok) {
    console.log(`${tag} Failed to fetch bulk emails (status=${emailResponse.status})`);
    throw new Error(`${tag} Failed to fetch bulk emails: ${emailResponse.status}`);
  }
  console.log(`${tag} Bulk email response returned ${emailData.length} entries`);

  const members = emailData
    .filter(entry => entry.email)
    .map(entry => ({ email: entry.email }));
  console.log(`${tag} Returning ${members.length} members with emails`);

  return members;
}