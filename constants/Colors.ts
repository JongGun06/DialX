// constants/Colors.ts

const dark = {
  background: '#000000',
  surface: '#121212',
  primary: '#BB86FC',
  text: '#FFFFFF',
  textSecondary: '#B3B3B3',
  error: '#CF6679',
  success: '#03DAC5',
  overlay: 'rgba(0,0,0,0.5)',
  avatarBorder: 'rgba(255,255,255,0.5)',
  drawerActiveBackground: 'rgba(187, 134, 252, 0.1)',
};

const dialx = {
  background: '#000000',
  surface: '#2F1423',
  primary: '#700877',
  text: '#FFFFFF',
  textSecondary: '#A36F8F',
  error: '#ff4d4d',
  success: '#28a745',
  overlay: 'rgba(0,0,0,0.4)',
  avatarBorder: 'rgba(255,255,255,0.5)',
  drawerActiveBackground: 'rgba(112, 8, 119, 0.2)',
};

export const themes = { dark, dialx };

export const colorPalettes = {
  primary: [
    '#700877', '#BB86FC', '#03DAC5', '#3F51B5', '#E91E63', '#4CAF50',
    '#FF5722', '#FFC107', '#00BCD4', '#8BC34A', '#9C27B0', '#FF9800'
  ],
  background: [
    '#000000', '#121212', '#1A1A2E', '#222831',
    '#F5F5F5', '#ECEFF1', '#FAFAFA', '#FFF8E1'
  ],
  surface: [
    '#2F1423', '#1E1E1E', '#162447', '#393E46',
    '#F0F0F0', '#D7CCC8', '#CFD8DC', '#EEEEEE'
  ],
  text: [
    '#FFFFFF', '#9b0000ff', '#000000ff',
    '#212121', '#757575', '#FFEB3B', '#00FF00', '#FF4081'
  ]
};


export const defaultTheme = dialx;