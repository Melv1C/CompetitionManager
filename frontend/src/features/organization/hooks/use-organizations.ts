import { authClient } from '@/lib/auth-client';

export const useOrganizations = () => {
  const { data: organization, refetch: refetchOrganizations, isPending: isLoadingOrganizations } = authClient.useListOrganizations();
  const { data: activeOrganization, refetch: refetchActiveOrganization, isPending: isLoadingActiveOrganization } = authClient.useActiveOrganization();

  const setActiveOrganization = (organizationId: string) => {
    authClient.organization.setActive({
      organizationId,
    });
  };

  return {
    organizations: organization || [],
    activeOrganization: activeOrganization || null,
    isLoadingOrganizations,
    isLoadingActiveOrganization,
    refetchOrganizations,
    refetchActiveOrganization,
    setActiveOrganization,
  };
}
