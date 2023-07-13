import { StyleSheet } from 'react-native';

import RedditView from '../../components/RedditView/RedditView';
import { Text, View } from '../../components/Themed';

export default function TabTwoScreen() {
  return (
    <View style={styles.container}>
      <RedditView path="app/(tabs)/two.tsx" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
