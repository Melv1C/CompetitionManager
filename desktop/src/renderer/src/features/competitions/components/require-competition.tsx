import { useOrganizations } from '@/features/organization'
import { OrganizationSelector } from '@/features/organization/components/organization-selector'
import { useCompetitionStore } from '@/store/competition'
import { type PropsWithChildren } from 'react'
import { OrganizationCompetitionsList } from './organization-competitions-list'

export function RequireCompetition({ children }: PropsWithChildren) {
  const { activeOrganization } = useOrganizations()

  const competitionEid = useCompetitionStore((state) => state.competitionEid)

  // Show competition selection if no competition is selected
  if (!competitionEid) {
    return (
      <div className="flex items-center justify-center bg-background m-16">
        <div className="w-full max-w-6xl mx-auto space-y-8">
          {/* Organization Selector Section */}
          <div className="max-w-md mx-auto">
            <h2 className="text-lg font-semibold mb-3 text-center">Choose Organization</h2>
            <OrganizationSelector />
          </div>

          {/* Competition List Section */}
          {activeOrganization && (
            <div className="border-t border-border pt-8">
              <OrganizationCompetitionsList />
            </div>
          )}
        </div>
      </div>
    )
  }

  // Show children if competition is selected
  return <>{children}</>
}
