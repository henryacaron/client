import { EthAddress } from '@darkforest_eth/types';
import React from 'react';
import styled from 'styled-components';
import { AlignCenterHorizontally, EmSpacer } from '../Components/CoreUI';
import { AccountLabel } from '../Components/Labels/Labels';
import { Sub, Text } from '../Components/Text';
import { TooltipName } from '../Game/WindowManager';
import { TooltipTrigger } from '../Panes/Tooltip';
import { usePlayer, useUIManager } from '../Utils/AppHooks';
import { GameWindowZIndex } from '../Utils/constants';
import { ModalTwitterVerifyIcon } from './ModalIcon';
import { ModalHook } from './ModalPane';
import { NetworkHealth } from './NetworkHealth';

const TopRightBarContainer = styled.div`
  z-index: ${GameWindowZIndex.MenuBar};
  padding: 0 2px;
`;

function BoardPlacement({ account }: { account: EthAddress | undefined }) {
  const uiManager = useUIManager();
  const player = usePlayer(uiManager, account);

  let content;

  if (player.value == undefined) {
    content = <Sub>n/a</Sub>;
  } else {
    let formattedScore = 'n/a';
    console.log(`stockpile : ${JSON.stringify(player.value)}`)
    if (player.value.stockpile !== undefined && player.value.stockpile !== null) {
      formattedScore = player.value.stockpile.toLocaleString();
    }

    content = (
      <Sub>
        <TooltipTrigger name={TooltipName.Stockpile}>
          Stockpile: <Text>{formattedScore}</Text>
        </TooltipTrigger>
      </Sub>
    );
  }

  return <Points>{content}</Points>;
}

const Points = styled.div`
  display: inline-block;
`;

export function TopRightBar({ stockpileHook }: { stockpileHook: ModalHook }) {
  const uiManager = useUIManager();
  const player = usePlayer(uiManager);
  const account = player.value?.address;

  return (
    <TopRightBarContainer>
      <AlignCenterHorizontally style={{ width: '100%', justifyContent: 'space-between' }}>
        <EmSpacer width={1} />
        <BoardPlacement account={account} />
        <EmSpacer width={1} />
      </AlignCenterHorizontally>
    </TopRightBarContainer>
  );
}
