import { createApp } from 'vue'
//import { createVuetify, type ThemeDefinition } from 'vuetify'


// Vuetify setup
import 'vuetify/styles';
import { createVuetify } from 'vuetify';
import { aliases, mdi } from 'vuetify/iconsets/mdi';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';

console.log('hellooooo')
console.log('createVuetify', createVuetify)

// const myCustomLightTheme: ThemeDefinition = {
//   dark: false,
//   colors: {
//     background: '#FFFFFF',
//     surface: '#FFFFFF',
//     primary: '#6200EE',
//     'primary-darken-1': '#3700B3',
//     secondary: '#03DAC6',
//     'secondary-darken-1': '#018786',
//     error: '#B00020',
//     info: '#2196F3',
//     success: '#4CAF50',
//     warning: '#FB8C00',
//   },
// }




const vuetify = createVuetify({
  components,
  directives,
  theme: {
    current: 'dark', // Default to system theme
    defaultTheme: 'dark', // Default to system theme
    themes: {
      light: {
        dark: false,
        colors: {
          background: '#FFFFFF',
          surface: '#F5F5F5',
          primary: '#6200EE',
          secondary: '#03DAC6',
          error: '#B00020',
        },
      },
      dark: {
        dark: true,
        colors: {
          background: '#121212',
          surface: '#1E1E1E',
          primary: '#BB86FC',
          secondary: '#03DAC6',
          error: '#CF6679',
        },
      },
    },
  },
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: { mdi },
  },
  // theme: {
  //   defaultTheme: 'myCustomLightTheme',
  //   themes: {
  //     myCustomLightTheme,
  //   },
  // },
})


console.log('vuetify', vuetify)
export default vuetify;


//
//
// const vuetify = createVuetify({
//   components,
//   directives,
//   theme: {
//     defaultTheme: 'system', // Default to system theme
//     themes: {
//       light: {
//         dark: false,
//         colors: {
//           background: '#FFFFFF',
//           surface: '#F5F5F5',
//           primary: '#6200EE',
//           secondary: '#03DAC6',
//           error: '#B00020',
//         },
//       },
//       dark: {
//         dark: true,
//         colors: {
//           background: '#121212',
//           surface: '#1E1E1E',
//           primary: '#BB86FC',
//           secondary: '#03DAC6',
//           error: '#CF6679',
//         },
//       },
//     },
//   },
//   icons: {
//     defaultSet: 'mdi',
//     aliases,
//     sets: { mdi },
//   },
// });
