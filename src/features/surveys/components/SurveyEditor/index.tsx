import { Box } from '@mui/material';
import { FC } from 'react';

import AddBlocks from './AddBlocks';
import BlockWrapper from './blocks/BlockWrapper';
import ChoiceQuestionBlock from './blocks/ChoiceQuestionBlock';
import OpenQuestionBlock from './blocks/OpenQuestionBlock';
import SurveyDataModel from 'features/surveys/models/SurveyDataModel';
import TextBlock from './blocks/TextBlock';
import ZUIFuture from 'zui/ZUIFuture';
import {
  ELEMENT_TYPE,
  RESPONSE_TYPE,
  ZetkinSurveyTextElement,
} from 'utils/types/zetkin';

interface SurveyEditorProps {
  model: SurveyDataModel;
}

const SurveyEditor: FC<SurveyEditorProps> = ({ model }) => {
  function handleDelete(elemId: number) {
    model.deleteElement(elemId);
  }

  function handleToggleHidden(elemId: number, hidden: boolean) {
    model.toggleElementHidden(elemId, hidden);
  }

  function handleTextBlockUpdate(
    elemId: number,
    textBlock: ZetkinSurveyTextElement['text_block']
  ) {
    model.updateTextBlock(elemId, textBlock);
  }

  return (
    <>
      <ZUIFuture future={model.getData()}>
        {(data) => {
          const mostRecentlyAddedElement = data.elements
            .concat()
            .sort((elem1, elem2) => elem2.id - elem1.id)[0];
          return (
            <Box paddingBottom={data.elements.length ? 4 : 0}>
              {data.elements.map((elem) => {
                if (elem.type == ELEMENT_TYPE.QUESTION) {
                  if (elem.question.response_type == RESPONSE_TYPE.TEXT) {
                    return (
                      <BlockWrapper
                        key={elem.id}
                        hidden={elem.hidden}
                        onDelete={() => handleDelete(elem.id)}
                        onToggleHidden={(hidden) =>
                          handleToggleHidden(elem.id, hidden)
                        }
                      >
                        <OpenQuestionBlock question={elem.question} />
                      </BlockWrapper>
                    );
                  } else if (
                    elem.question.response_type == RESPONSE_TYPE.OPTIONS
                  ) {
                    return (
                      <BlockWrapper
                        key={elem.id}
                        hidden={elem.hidden}
                        onDelete={() => handleDelete(elem.id)}
                        onToggleHidden={(hidden) =>
                          handleToggleHidden(elem.id, hidden)
                        }
                      >
                        <ChoiceQuestionBlock question={elem.question} />
                      </BlockWrapper>
                    );
                  }
                } else if (elem.type == ELEMENT_TYPE.TEXT) {
                  return (
                    <BlockWrapper
                      key={elem.id}
                      hidden={elem.hidden}
                      onDelete={() => handleDelete(elem.id)}
                      onToggleHidden={(hidden) =>
                        handleToggleHidden(elem.id, hidden)
                      }
                    >
                      <TextBlock
                        element={elem}
                        isMostRecent={elem.id === mostRecentlyAddedElement.id}
                        onSave={(textBlock) =>
                          handleTextBlockUpdate(elem.id, textBlock)
                        }
                      />
                    </BlockWrapper>
                  );
                }
              })}
            </Box>
          );
        }}
      </ZUIFuture>
      <AddBlocks model={model} />
    </>
  );
};

export default SurveyEditor;
