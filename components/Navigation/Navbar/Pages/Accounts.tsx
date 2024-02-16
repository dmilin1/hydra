import React, { ReactNode, useContext } from 'react';
import { HistoryContext, HistoryLayer } from '../../../../contexts/HistoryContext';
import DirectionButton from '../Components/DirectionButton';
import TextButton from '../Components/TextButton';
import IconButton from '../Components/IconButton';
import { ThemeContext } from '../../../../contexts/ThemeContext';
import { Entypo } from '@expo/vector-icons';
import { AccountContext } from '../../../../contexts/AccountContext';


export default function Settings() {
  const history = useContext(HistoryContext);
  const { theme } = useContext(ThemeContext);
  const { setShowLoginModal } = useContext(AccountContext);

  return (
    <>
      <DirectionButton direction='backward' />
      <TextButton text={history.past.slice(-1)[0]?.name}/>
      <IconButton
        icon={<Entypo name="plus" size={24} color={theme.buttonText} />}
        onPress={() => setShowLoginModal(true)}
        justifyContent='flex-end'
      />
    </>
  );
}
