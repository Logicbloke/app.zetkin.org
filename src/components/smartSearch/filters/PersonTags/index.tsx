/* eslint-disable react-hooks/exhaustive-deps */
import { FormattedMessage as Msg } from 'react-intl';
import { useQuery } from 'react-query';
import { useRouter } from 'next/router';
import { Box, Chip, MenuItem } from '@material-ui/core';
import { FormEvent, useEffect, useState } from 'react';

import FilterForm from '../../FilterForm';
import getTags from 'fetching/getTags';
import StyledNumberInput from '../../inputs/StyledNumberInput';
import StyledSelect from '../../inputs/StyledSelect';
import StyledTagSelect from 'components/smartSearch/inputs/StyledTagSelect';
import useSmartSearchFilter from 'hooks/useSmartSearchFilter';
import { ZetkinTag } from 'types/zetkin';
import { CONDITION_OPERATOR, NewSmartSearchFilter, OPERATION, PersonTagsFilterConfig,
    SmartSearchFilterWithId, ZetkinSmartSearchFilter } from 'types/smartSearch';

const MIN_MATCHING = 'min_matching';

interface PersonTagsProps {
    filter:  SmartSearchFilterWithId<PersonTagsFilterConfig> | NewSmartSearchFilter ;
    onSubmit: (
        filter: SmartSearchFilterWithId<PersonTagsFilterConfig> |
        ZetkinSmartSearchFilter<PersonTagsFilterConfig>
        ) => void;
    onCancel: () => void;
}

const PersonTags = (
    { onSubmit, onCancel, filter: initialFilter }: PersonTagsProps,
): JSX.Element => {
    const { orgId } = useRouter().query;
    const tagsQuery = useQuery(['tags', orgId], getTags(orgId as string));
    const tags = tagsQuery?.data || [];

    const { filter, setConfig, setOp } = useSmartSearchFilter<PersonTagsFilterConfig>(
        initialFilter, {
            condition: CONDITION_OPERATOR.ALL,
            tags: [],
        });

    //keep minMatching in state so last value is saved even when removed from config
    const [minMatching, setMinMatching] = useState(filter.config.min_matching || 1);

    useEffect(() => {
        if (filter.config.condition === CONDITION_OPERATOR.ANY)
            setConfig({ ...filter.config, min_matching: minMatching });
    }, [minMatching]);

    // preserve the order of the tag array
    const selectedTags = filter.config.tags.reduce((acc: ZetkinTag[], id) => {
        const tag = tags.find(tag => tag.id === id);
        if (tag) {
            return acc.concat(tag);
        }
        return acc;
    }, []);

    const selected = filter.config.min_matching ?
        MIN_MATCHING : filter.config.condition;

    // only submit if at least one tag has been added
    const submittable = !!filter.config.tags.length;

    // event handlers
    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        onSubmit(filter);
    };

    const handleConditionChange = (conditionValue: string) => {
        if (conditionValue === MIN_MATCHING) {
            setConfig({
                ...filter.config,
                condition: CONDITION_OPERATOR.ANY,
                min_matching: minMatching,
            });
        }
        else {
            setConfig({
                ...filter.config,
                condition: conditionValue as CONDITION_OPERATOR,
                min_matching: undefined,
            });
        }
    };

    const handleTagChange = (tags: ZetkinTag[]) => {
        setConfig({ ...filter.config, tags: tags.map(t => t.id) });
    };

    const handleTagDelete = (tag: ZetkinTag) => {
        setConfig({ ...filter.config, tags: filter.config.tags.filter(t => t !== tag.id ) });
    };

    return (
        <FilterForm
            disableSubmit={ !submittable }
            onCancel={ onCancel }
            onSubmit={ e => handleSubmit(e) }
            renderExamples={ () => (
                <>
                    <Msg id="misc.smartSearch.person_tags.examples.one"/>
                    <br />
                    <Msg id="misc.smartSearch.person_tags.examples.two"/>
                </>
            ) }
            renderSentence={ () => (
                <Msg id="misc.smartSearch.person_tags.inputString" values={{
                    addRemoveSelect: (
                        <StyledSelect onChange={ e => setOp(e.target.value as OPERATION) }
                            value={ filter.op }>
                            { Object.values(OPERATION).map(o => (
                                <MenuItem key={ o } value={ o }>
                                    <Msg id={ `misc.smartSearch.person_tags.addRemoveSelect.${o}` }/>
                                </MenuItem>
                            )) }
                        </StyledSelect>
                    ),
                    condition: (
                        <Msg
                            id={ `misc.smartSearch.condition.edit.${selected}` }
                            values={{
                                conditionSelect: (
                                    <StyledSelect
                                        onChange={ e => handleConditionChange(e.target.value) }
                                        value={ selected }>
                                        { Object.values(CONDITION_OPERATOR).map(o => (
                                            <MenuItem key={ o } value={ o }>
                                                <Msg
                                                    id={ `misc.smartSearch.condition.conditionSelect.${o}` }
                                                />
                                            </MenuItem>
                                        )) }
                                        <MenuItem key={ MIN_MATCHING } value={ MIN_MATCHING }>
                                            <Msg
                                                id="misc.smartSearch.condition.conditionSelect.min_matching"
                                            />
                                        </MenuItem>
                                    </StyledSelect>
                                ),
                                minMatchingInput: (
                                    <StyledNumberInput
                                        inputProps={{ max: filter.config.tags.length, min: '1' }}
                                        onChange={ (e) => setMinMatching(+e.target.value) }
                                        value={ minMatching }
                                    />
                                ),
                            }}
                        />
                    ),
                    tags: (
                        <Box
                            alignItems="center"
                            display="inline-flex"
                            style={{ verticalAlign: 'middle' }}>
                            { selectedTags.map((tag) => {
                                return (
                                    <Chip
                                        key={ tag.id }
                                        label={ tag.title }
                                        onDelete={ () => handleTagDelete(tag) }
                                        style={{ margin: '3px' }}
                                        variant="outlined"
                                    />
                                );
                            }) }
                            { selectedTags.length < tags.length && (
                                <StyledTagSelect
                                    getOptionDisabled={ t => selectedTags.includes(t) }
                                    getOptionLabel={ t => t.title }
                                    onChange={ (_, v) => handleTagChange(v) }
                                    options={ tags }
                                    value={ tags.filter(t => filter.config.tags.includes(t.id)) }
                                />) }
                        </Box>
                    ),
                }}
                />
            ) }
        />
    );
};

export default PersonTags;