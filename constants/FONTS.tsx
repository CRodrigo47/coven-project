// No necesitas importar las fuentes aquí, solo definir los nombres que usarás
export const FONTS = {
    regular: 'Montserrat_400Regular',
    bold: 'Montserrat_700Bold',
    semiBold: 'Montserrat_600SemiBold',
    light: 'Montserrat_300Light',
    italic: 'Montserrat_400Regular_Italic',
    boldItalic: 'Montserrat_700Bold_Italic',
    medium: 'Montserrat_500Medium'
    // Agrega otras variantes según las que hayas instalado
  };
  
  // Tipos para TypeScript (opcional pero recomendado)
  export type FontFamily = keyof typeof FONTS;