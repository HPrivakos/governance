import { useQuery } from '@tanstack/react-query'
import { Loader } from 'decentraland-ui/dist/components/Loader/Loader'

import { Governance } from '../../clients/Governance'
import { ONE_MINUTE_MS } from '../../hooks/constants'
import useFormatMessage from '../../hooks/useFormatMessage'
import { ActivityTickerEvent, EventType } from '../../shared/types/events'
import locations from '../../utils/locations'
import Avatar from '../Common/Avatar'
import Empty from '../Common/Empty'
import Heading from '../Common/Typography/Heading'
import Link from '../Common/Typography/Link'
import DelegationEvent from '../Events/DelegationEvent'
import ProposalRelatedEvent from '../Events/ProposalRelatedEvent'
import CircledComment from '../Icon/CircledComment'

import './ActivityTicker.css'

function getActivityTickerEvent(event: ActivityTickerEvent) {
  if (event.event_type === EventType.DelegationClear || event.event_type === EventType.DelegationSet) {
    return <DelegationEvent event={event} />
  } else {
    return <ProposalRelatedEvent event={event} />
  }
}

function getActivityTickerImage(item: ActivityTickerEvent) {
  if (!!item.address && item.event_type !== EventType.Commented) {
    return (
      <Link href={locations.profile({ address: item.address })}>
        <Avatar size="xs" avatar={item.avatar} address={item.address} />
      </Link>
    )
  }
  if (item.event_type === EventType.Commented) {
    return (
      <div>
        <CircledComment />
      </div>
    )
  }
}

export default function ActivityTicker() {
  const t = useFormatMessage()
  const { data: events, isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: () => Governance.get().getLatestEvents(),
    refetchInterval: ONE_MINUTE_MS,
    refetchIntervalInBackground: true,
  })

  return (
    <div className="ActivityTicker">
      <div className="ActivityTicker__TitleContainer">
        <div className="ActivityTicker__Gradient" />
        <Heading className="ActivityTicker__Title" size="3xs" weight="normal">
          {t('page.home.activity_ticker.title')}
        </Heading>
      </div>
      {isLoading && (
        <div className="ActivityTicker__LoadingContainer">
          <Loader active />
        </div>
      )}
      {!isLoading && (
        <>
          {events && events.length === 0 && (
            <div className="ActivityTicker__EmptyContainer">
              <Empty description={t('page.home.activity_ticker.no_activity')} />
            </div>
          )}
          {events && events.length > 0 && (
            <div className="ActivityTicker__List">
              {events.map((item) => {
                return (
                  <div key={item.id} className="ActivityTicker__ListItem">
                    {getActivityTickerImage(item)}
                    <div>{getActivityTickerEvent(item)}</div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}
