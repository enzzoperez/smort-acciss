import LogoG5Pro from '@/assets/svg/LogoG5Pro.svg';
import Menu from '@/assets/svg/Menu.svg';
import UserIcon from '@/assets/svg/UserIcon.svg';
import DrawerFromTop, { DrawerFromTopRef } from '@/components/drawer-from-top';
import { NativeStackHeaderProps } from '@react-navigation/native-stack';
import { useRef, useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CustomHeader({ navigation, options, route, back }: NativeStackHeaderProps) {
  const drawerRef = useRef<DrawerFromTopRef>(null);
  const insets = useSafeAreaInsets();

  const [isAccountOptionsOpen, setIsAccountOptionsOpen] = useState(false);

  return (
    <View
      style={{
        paddingTop: insets.top,
        height: 60 + insets.top,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingLeft: 24,
        paddingRight: 16,
        backgroundColor: 'transparent',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
      }}
    >
      <LogoG5Pro />
      <View style={{ flexDirection: 'row', gap: 16 }}>
        {true && (
          <TouchableOpacity
            onPress={() => {
              drawerRef.current?.open();
              setIsAccountOptionsOpen(true);
            }}
          >
            <UserIcon />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={() => {
            drawerRef.current?.open();
            setIsAccountOptionsOpen(false);
          }}
        >
          <Menu />
        </TouchableOpacity>
      </View>
      <DrawerFromTop ref={drawerRef} isAccountOptionsOpen={isAccountOptionsOpen} />
    </View>
  );
}
