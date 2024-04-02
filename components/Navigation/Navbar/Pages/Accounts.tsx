import React, { ReactNode, useContext } from 'react';
import { HistoryContext, HistoryLayer } from '../../../../contexts/HistoryContext';
import DirectionButton from '../Components/DirectionButton';
import TextButton from '../Components/TextButton';
import IconButton from '../Components/IconButton';
import { ThemeContext } from '../../../../contexts/ThemeContext';
import { Entypo } from '@expo/vector-icons';
import Login from '../../../Modals/Login';
import { ModalContext } from '../../../../contexts/ModalContext';


export default function Accounts() {
  const history = useContext(HistoryContext);
  const { theme } = useContext(ThemeContext);
  const { setModal } = useContext(ModalContext);

  return (
    <>
      <DirectionButton direction='backward' />
      <TextButton text={history.past.slice(-1)[0]?.name}/>
      <IconButton
        icon={<Entypo name="plus" size={24} color={theme.buttonText} />}
        onPress={() => setModal(<Login />)}
        justifyContent='flex-end'
      />
    </>
  );
}
