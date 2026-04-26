import BottomSheetGorhom, {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { forwardRef, ReactNode, useCallback, useImperativeHandle, useMemo, useRef } from 'react';
import { Platform, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { radii } from '@/theme';

export interface BottomSheetHandle {
  present: () => void;
  dismiss: () => void;
}

interface BottomSheetProps {
  children: ReactNode;
  snapPoints?: (string | number)[];
  onDismiss?: () => void;
  enableDynamicSizing?: boolean;
}

export const BottomSheet = forwardRef<BottomSheetHandle, BottomSheetProps>(function BottomSheet(
  { children, snapPoints, onDismiss, enableDynamicSizing = true },
  ref
) {
  const theme = useTheme();
  const innerRef = useRef<BottomSheetGorhom>(null);
  const points = useMemo(() => snapPoints ?? ['65%', '90%'], [snapPoints]);

  useImperativeHandle(
    ref,
    () => ({
      present: () => {
        if (Platform.OS === 'web') {
          innerRef.current?.expand();
        } else {
          innerRef.current?.snapToIndex(0);
        }
      },
      dismiss: () => innerRef.current?.close(),
    }),
    []
  );

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        pressBehavior="close"
        opacity={0.4}
      />
    ),
    []
  );

  const handleClose = useCallback(() => {
    onDismiss?.();
  }, [onDismiss]);

  return (
    <BottomSheetGorhom
      ref={innerRef}
      index={-1}
      snapPoints={enableDynamicSizing ? undefined : points}
      enableDynamicSizing={enableDynamicSizing}
      enablePanDownToClose
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      backdropComponent={renderBackdrop}
      backgroundStyle={{
        backgroundColor: theme.colors.card,
        borderTopLeftRadius: radii.card * 2,
        borderTopRightRadius: radii.card * 2,
      }}
      handleIndicatorStyle={{ backgroundColor: theme.colors.border }}
      onClose={handleClose}
    >
      <BottomSheetView style={styles.content}>{children}</BottomSheetView>
    </BottomSheetGorhom>
  );
});

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    paddingTop: 8,
  },
});
