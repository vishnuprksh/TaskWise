import { StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="#17211e" />
      <SafeAreaView style={styles.screen}>
        <View style={styles.content}>
          <Text testID="taskwise-brand" style={styles.eyebrow}>
            TASKWISE / ANDROID
          </Text>
          <View style={styles.rule} />
          <Text style={styles.title}>A clearer way to focus.</Text>
          <Text style={styles.body}>
            Your native workspace is ready for the TaskWise migration.
          </Text>
          <View style={styles.phase}>
            <Text style={styles.phaseNumber}>01</Text>
            <View>
              <Text testID="migration-phase" style={styles.phaseTitle}>
                Foundation
              </Text>
              <Text style={styles.phaseDescription}>
                Android build and app entry point are in place.
              </Text>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#17211e',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  eyebrow: {
    color: '#b9d2c0',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  rule: {
    width: 44,
    height: 3,
    backgroundColor: '#efad6d',
    marginTop: 22,
    marginBottom: 28,
  },
  title: {
    color: '#f4f3e9',
    fontSize: 36,
    fontWeight: '700',
    lineHeight: 42,
    maxWidth: 340,
  },
  body: {
    color: '#c0c9c1',
    fontSize: 16,
    lineHeight: 24,
    marginTop: 14,
    maxWidth: 310,
  },
  phase: {
    alignItems: 'center',
    borderTopColor: '#3b4943',
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 18,
    marginTop: 48,
    paddingTop: 20,
  },
  phaseNumber: {
    color: '#efad6d',
    fontSize: 24,
    fontWeight: '700',
  },
  phaseTitle: {
    color: '#f4f3e9',
    fontSize: 15,
    fontWeight: '700',
  },
  phaseDescription: {
    color: '#c0c9c1',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 3,
  },
});

export default App;
