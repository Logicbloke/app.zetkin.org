import { GetServerSideProps } from 'next';
import { Grid } from '@mui/material';
import Head from 'next/head';
import { useContext } from 'react';
import { useQueryClient } from 'react-query';

import BackendApiClient from 'core/api/client/BackendApiClient';
import { PageWithLayout } from 'utils/types';
import PersonDetailsCard from 'features/profile/components/PersonDetailsCard';
import PersonJourneysCard from 'features/profile/components/PersonJourneysCard';
import PersonOrganizationsCard from 'features/profile/components/PersonOrganizationsCard';
import { personTagsResource } from 'features/profile/api/people';
import SinglePersonLayout from 'features/profile/layout/SinglePersonLayout';
import { TagManagerSection } from 'features/tags/components/TagManager';
import useCustomFields from 'features/profile/hooks/useCustomFields';
import useJourneys from 'features/journeys/hooks/useJourneys';
import { useNumericRouteParams } from 'core/hooks';
import usePerson from 'features/profile/hooks/usePerson';
import useTagging from 'features/tags/hooks/useTagging';
import ZUIFuture from 'zui/ZUIFuture';
import ZUIQuery from 'zui/ZUIQuery';
import ZUISnackbarContext from 'zui/ZUISnackbarContext';
import { scaffold, ScaffoldedGetServerSideProps } from 'utils/next';

export const scaffoldOptions = {
  authLevelRequired: 2,
  localeScope: ['layout.organize', 'pages.people'],
};

export const getPersonScaffoldProps: ScaffoldedGetServerSideProps = async (
  ctx
) => {
  const { orgId, personId } = ctx.params!;

  try {
    const apiClient = new BackendApiClient(ctx.req.headers);
    await apiClient.get(`/api/orgs/${orgId}/people/${personId}`);
    return {
      props: {
        orgId,
        personId,
      },
    };
  } catch (err) {
    return {
      notFound: true,
    };
  }
};

export const getServerSideProps: GetServerSideProps = scaffold(
  getPersonScaffoldProps,
  scaffoldOptions
);

const PersonProfilePage: PageWithLayout = () => {
  const { orgId, personId } = useNumericRouteParams();
  const { showSnackbar } = useContext(ZUISnackbarContext);
  const queryClient = useQueryClient();

  const { assignToPerson, removeFromPerson } = useTagging(orgId);

  const { key: personTagsKey, useQuery: usePersonTagsQuery } =
    personTagsResource(orgId.toString(), personId.toString());

  const fieldsFuture = useCustomFields(orgId);
  const personFuture = usePerson(orgId, personId);
  const person = personFuture.data;

  const personTagsQuery = usePersonTagsQuery();

  const journeysFuture = useJourneys(orgId);

  if (!person) {
    return null;
  }

  return (
    <>
      <Head>
        <title>
          {person?.first_name} {person?.last_name}
        </title>
      </Head>
      <Grid container direction="row" spacing={6}>
        <Grid item lg={4} xs={12}>
          <ZUIFuture future={fieldsFuture}>
            {(fields) => (
              <PersonDetailsCard customFields={fields} person={person} />
            )}
          </ZUIFuture>
        </Grid>
        <Grid item lg={4} xs={12}>
          <ZUIQuery queries={{ personTagsQuery }}>
            {({ queries: { personTagsQuery } }) => (
              <TagManagerSection
                assignedTags={personTagsQuery.data}
                onAssignTag={async (tag) => {
                  try {
                    await assignToPerson(personId, tag.id, tag.value);
                  } catch (err) {
                    showSnackbar('error');
                  }
                }}
                onTagEdited={() => {
                  queryClient.invalidateQueries(personTagsKey);
                }}
                onUnassignTag={async (tag) => {
                  try {
                    await removeFromPerson(personId, tag.id);
                  } catch (err) {
                    showSnackbar('error');
                  }
                }}
              />
            )}
          </ZUIQuery>
        </Grid>
        {journeysFuture.data?.length && (
          <Grid item lg={4} xs={12}>
            <PersonJourneysCard
              orgId={orgId.toString()}
              personId={personId.toString()}
            />
          </Grid>
        )}
        <Grid item lg={4} xs={12}>
          <PersonOrganizationsCard
            orgId={orgId.toString()}
            personId={personId.toString()}
          />
        </Grid>
      </Grid>
    </>
  );
};

PersonProfilePage.getLayout = function getLayout(page) {
  return <SinglePersonLayout>{page}</SinglePersonLayout>;
};

export default PersonProfilePage;
