import { EthAddress, LocationId, Planet } from '@darkforest_eth/types';
import React, { Dispatch, SetStateAction, useEffect, useState, useCallback } from 'react';
import styled from 'styled-components';
import { Btn } from '../Components/Btn';
import { formatNumber } from '../../Backend/Utils/Utils';
import { CenterBackgroundSubtext, Padded, Spacer, EmSpacer } from '../Components/CoreUI';
import { LoadingSpinner } from '../Components/LoadingSpinner';
import { Icon, IconType } from '../Components/Icons';
import { Blue, White, Subber, LongDash } from '../Components/Text';
import { TimeUntil } from '../Components/TimeUntil';
import dfstyles from '../Styles/dfstyles';
import { usePlanet, useUIManager } from '../Utils/AppHooks';
import { useEmitterValue } from '../Utils/EmitterHooks';
import { ModalHandle } from '../Views/ModalPane';

const DEFAULT_SILVER_PERCENT = 50;

const StockpileWrapper = styled.div`
  & .row {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    & > span {
      &:first-child {
        color: ${dfstyles.colors.subtext};
        padding-right: 1em;
      }
    }
  }
  & .message {
    margin: 1em 0;

    & p {
      margin: 0.5em 0;

      &:last-child {
        margin-bottom: 1em;
      }
    }
  }
`;
const StyledResourceBar = styled.div`
  margin: 0.5em;

  input[type='range'] {
    width: 100%;
  }

  & div {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
`;
const StyledRowIcon = styled.div`
  margin-right: 0.75em;
`;

const enum RowType {
  Energy,
  Silver,
  Artifact,
}

export function StockpilePaneHelpContent() {
  return (
    <div>
      Send this planet's silver to your stockpile!
      <Spacer height={8} />
      This will allow you to spend it on player upgrades and special weapons.
    </div>
  );
}

const StyledShowPercent = styled.div`
  display: inline-block;

  & > span:first-child {
    width: 3em;
    text-align: right;
    margin-right: 1em;
  }

  & > span:last-child {
    color: ${dfstyles.colors.subtext};
    & > span {
      ${dfstyles.prefabs.noselect};
      &:hover {
        color: ${dfstyles.colors.text};
        cursor: pointer;
      }
      &:first-child {
        margin-right: 0.5em;
      }
    }
  }
`;
function ShowPercent({
  value,
  setValue,
}: {
  value: number;
  setValue: Dispatch<SetStateAction<number>>;
}) {
  return (
    <StyledShowPercent>
      <span>{value}%</span>
      <span>
        <span onClick={() => setValue((x) => x - 1)}>
          <LongDash />
        </span>
        <span onClick={() => setValue((x) => x + 1)}>+</span>
      </span>
    </StyledShowPercent>
  );
}

function ResourceRowIcon({ rowType }: { rowType: RowType }) {
  return (
    <StyledRowIcon>
      {rowType === RowType.Silver && <Icon type={IconType.Silver} />}
    </StyledRowIcon>
  );
}

function ResourceBar({
  isSilver,
  selected,
  value,
  setValue,
}: {
  isSilver?: boolean;
  selected: Planet | undefined;
  value: number;
  setValue: (x: number) => void;
}) {
  const getResource = useCallback(
    (val: number) => {
      if (!selected) return '';
      return formatNumber((val / 100) * selected.silver);
    },
    [selected, isSilver]
  );

  return (
    <StyledResourceBar>
      <div>
        <div>
          <ResourceRowIcon rowType={RowType.Silver} />
          {getResource(value)}
          <EmSpacer width={1} />
          <Subber>silver</Subber>
        </div>
        <ShowPercent value={value} setValue={setValue} />
      </div>
      <Spacer height={2} />
      <input
        type='range'
        min={0}
        max={100}
        value={value}
        step={1}
        onChange={(e) => setValue(parseInt(e.target.value))}
      />
    </StyledResourceBar>
  );
}
export function StockpilePane({
  initialPlanetId,
  modal: _modal,
}: {
  modal: ModalHandle;
  initialPlanetId: LocationId | undefined;
}) {
  const uiManager = useUIManager();
  const planetId = useEmitterValue(uiManager.selectedPlanetId$, initialPlanetId);
  const planet = usePlanet(uiManager, planetId).value;
  const getLoc = () => {
    if (!planet || !uiManager) return { x: 0, y: 0 };
    const loc = uiManager.getLocationOfPlanet(planet.locationId);
    if (!loc) return { x: 0, y: 0 };
    return loc.coords;
  };

  const sendSilver = () => {
    if (!planet || !uiManager) return;
    const loc = uiManager.getLocationOfPlanet(planet.locationId);
    if (!loc) return;

    uiManager.sendToStockpile(planet.locationId, Math.round((silverPercent / 100) * planet.silver));
  };

  const silverHook = useState<number>(
    DEFAULT_SILVER_PERCENT
  );

  const [account, setAccount] = useState<EthAddress | undefined>(undefined); // consider moving this one to parent
  const [silver, setSilver] = useState<number>(50);
  const [silverPercent, setSilverPercent] = silverHook;

  useEffect(() => {
    if (!uiManager) return;
    setAccount(uiManager.getAccount());
  }, [uiManager]);

  let stockpileBtn = undefined;

  if (planet?.silver == 0) {
    stockpileBtn = <Btn disabled={true}>Stockpile Silver</Btn>;
  } else if (planet?.unconfirmedReveal) {
    stockpileBtn = (
      <Btn disabled={true}>
        {planet.unconfirmedSendToStockpile && <LoadingSpinner initialText={'Stockpiling...'} />}
        {!planet.unconfirmedSendToStockpile && 'Send to stockpile'}
      </Btn>
    );
  } else {
    stockpileBtn = (
      <Btn onClick={sendSilver}>
        Send to stockpile
      </Btn>
    );
  }

  return (
    <Padded>
      {planet ? (
        <StockpileWrapper>
          <div>
            You can send planet silver to your stockpile. Stockpiled silver can be used to buy
            player upgrades and special weapons.
          </div>
          {planet.silver > 0 ?
          <ResourceBar
            selected={planet}
            value={silverPercent}
            setValue={setSilverPercent}
            isSilver
          /> :
            <Subber>this planet holds no silver</Subber>
          }
          {/* <div className='row'>
            <span>Coordinates</span>
            <span>{`(${getLoc().x}, ${getLoc().y})`}</span>
          </div> */}
          {/* {p.value && p.value.silver > 0 && (
            <ResourceBar
              selected={p.value}
              value={silverPercent}
              setValue={setSilverPercent}
              isSilver
            />
          )} */}
          <Spacer height={8} />
          <p style={{ textAlign: 'right' }}>{stockpileBtn}</p>
        </StockpileWrapper>
      ) : (
        <CenterBackgroundSubtext width='100%' height='75px'>
          Select a Planet
        </CenterBackgroundSubtext>
      )}
    </Padded>
  );
}