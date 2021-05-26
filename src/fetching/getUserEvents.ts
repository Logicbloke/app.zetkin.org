import { defaultFetch } from '.';
import { ZetkinEvent, ZetkinEventResponse } from '../types/zetkin';

export default function getUserEvents(fetch = defaultFetch) {
    return async () : Promise<ZetkinEvent[]> => {
        const fRes = await fetch(`/users/me/following`);
        const fData = await fRes.json();

        const bookedRes = await fetch('/users/me/actions');
        const bookedData = await bookedRes.json();

        const rRes = await fetch('/users/me/action_responses');
        const rData = await rRes.json();

        const userEventsData = [];

        if (fData.data) {
            for (const fObj of fData.data) {
                const eventsRes = await fetch(`/orgs/${fObj.organization.id}/actions`);
                const eventsData = await eventsRes.json();

                const org = {
                    id: fObj.organization.id,
                    title: fObj.organization.title,
                };

                if (eventsData.data && eventsData.data.length > 0) {
                    for (const eObj of eventsData.data) {
                        const isBookedEvent = bookedData.data.some((booked : ZetkinEvent) =>
                            booked.id === eObj.id);

                        const hasEventResponse = rData.data.some((response : ZetkinEventResponse) =>
                            response.action_id === eObj.id);

                        userEventsData.push({
                            ...eObj,
                            organization: org,
                            userBooked: isBookedEvent,
                            userResponse: hasEventResponse,
                        });
                    }
                }
            }
        }
        return userEventsData;
    };
}