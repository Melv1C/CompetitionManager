import { authClient } from '@/lib/auth-client';

export const useOrganizations = () => {
  const { data: organization } = authClient.useListOrganizations();
  const { data: activeOrganization } = authClient.useActiveOrganization();

  const setActiveOrganization = (organizationId: string) => {
    authClient.organization.setActive({
      organizationId,
    });
  };

  return {
    organizations: organization || [],
    activeOrganization: activeOrganization || null,
    setActiveOrganization,
  };
}
