import { StyleSheet } from 'react-native';

import RedditView from '../../components/RedditView/RedditView';
import { Text, View } from '../../components/Themed';

export default function TabOneScreen() {
  return (
    <View style={styles.container}>
      <RedditView path="app/(tabs)/index.tsx" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
