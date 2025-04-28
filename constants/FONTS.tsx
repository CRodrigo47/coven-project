// No necesitas importar las fuentes aquí, solo definir los nombres que usarás
export const FONTS = {
  regular: 'BeVietnamPro_400Regular',
  bold: 'BeVietnamPro_700Bold',
  semiBold: 'BeVietnamPro_600SemiBold',
  light: 'BeVietnamPro_300Light',
  italic: 'BeVietnamPro_400Regular_Italic',
  boldItalic: 'BeVietnamPro_700Bold_Italic',
  medium: 'BeVietnamPro_500Medium',
};
  
  // Tipos para TypeScript (opcional pero recomendado)
  export type FontFamily = keyof typeof FONTS;