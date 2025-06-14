import { authClient } from '@/lib/auth-client';

export const useOrganizations = () => {
  const { data: organization, refetch: refetchOrganizations } = authClient.useListOrganizations();
  const { data: activeOrganization, refetch: refetchActiveOrganization } = authClient.useActiveOrganization();

  const setActiveOrganization = (organizationId: string) => {
    authClient.organization.setActive({
      organizationId,
    });
  };

  return {
    organizations: organization || [],
    activeOrganization: activeOrganization || null,
    refetchOrganizations,
    refetchActiveOrganization,
    setActiveOrganization,
  };
}
