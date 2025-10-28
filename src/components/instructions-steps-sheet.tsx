import ArrowRight from '@/assets/svg/ArrowRight.svg';
import CloseIcon from '@/assets/svg/CloseModalIcon.svg';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { SheetInstructions } from './sheet-instructions';
import { ThemedText } from './themed-text';
import { useAppTranslation } from '@/libs/i18n';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const InstructionsStepsSheet = ({
  isVisible,
  onClose,
}: {
  isVisible: boolean;
  onClose: () => void;
}) => {
  const { t } = useAppTranslation(['preLogin', 'commons']);
  const insets = useSafeAreaInsets();

  const steps = t('instructionsSteps.steps', { returnObjects: true }) as {
    title: string;
    description: string;
  }[];

  return (
    <SheetInstructions scrollable isVisible={isVisible} onDismiss={onClose}>
      <View style={[styles.containerSheet, { paddingBottom: insets.bottom }]}>
        <View style={styles.header}>
          <TouchableOpacity
            style={{
              flex: 1,
              alignItems: 'flex-end',
              marginBottom: 16,
            }}
            onPress={onClose}
          >
            <CloseIcon />
          </TouchableOpacity>
          <ThemedText style={styles.titleSheet}>Cómo accedo al fast pass</ThemedText>
        </View>

        {steps.map((item) => (
          <View key={item.title} style={styles.item}>
            <ArrowRight />
            <View style={styles.textContainer}>
              {item.title === '' ? null : (
                <ThemedText type="title" style={styles.titleItem}>
                  {item.title}
                </ThemedText>
              )}

              <ThemedText style={styles.descriptionItem}>{item.description}</ThemedText>
            </View>
          </View>
        ))}
      </View>
    </SheetInstructions>
  );
};

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 32,
  },
  header: {
    marginBottom: 32,
  },
  containerSheet: {
    flex: 1,
    paddingHorizontal: 20,
    // paddingTop: 16,
  },
  titleSheet: {
    fontSize: 28,
    lineHeight: 28,
    fontWeight: '600',
    color: '#000',
  },
  textContainer: {
    flex: 1,
  },
  titleItem: {
    fontSize: 18,
    color: '#111',
    marginBottom: 6,
  },
  descriptionItem: {
    fontSize: 18,
    color: '#111',
    lineHeight: 20,
  },
});
