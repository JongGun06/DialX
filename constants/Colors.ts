// constants/Colors.ts

const dark = {
  background: '#000000',
  surface: '#303030ff',
  primary: '#1b1a21ff',
  text: '#FFFFFF',
  textSecondary: '#B3B3B3',
  error: '#CF6679',
  success: '#03DAC5',
  overlay: 'rgba(0,0,0,0.5)',
  avatarBorder: 'rgba(255,255,255,0.5)',
  drawerActiveBackground: 'rgba(116, 25, 227, 1)',
};

const dialx = {
  background: '#fff',
  surface: '#817c7eff',
  primary: '#2e36a9ff',
  text: '#000',
  textSecondary: '#000000ff',
  error: '#ff4d4d',
  success: '#28a745',
  overlay: 'rgba(0,0,0,0.4)',
  avatarBorder: '#fff',
  drawerActiveBackground: '#fff',
};

export const themes = {
    dark,
    dialx,
};

// По умолчанию экспортируем нашу тему
export const Colors = dialx;