/* eslint-env node */

const path = require('path');



const isDevelopment = process.env.NODE_ENV === 'development';

const postcssConfig = {
  plugins: [

    require('@csstools/postcss-global-data')({
      files: [
        './node_modules/open-props/media.min.css',
        './src/css/custom-properties.css',
      ]
    }),

    // https://github.com/argyleink/open-props
    // https://github.com/GoogleChromeLabs/postcss-jit-props
    // require('postcss-jit-props')(require('open-props')),
    require('postcss-jit-props')({
      // files: [path.resolve(__dirname, './src/css/custom-properties.css')],
      ...require('open-props'),
      custom_selector: ':where(html)'
    }),

    require('autoprefixer'),

    // https://github.com/csstools/postcss-plugins/tree/main/plugins/postcss-custom-media
    require('postcss-custom-media')({
      preserve: isDevelopment
    }),


    // https://purgecss.com/configuration.html
    // require('@fullhuman/postcss-purgecss')({
    //   content: [
    //     './src/**/*.html',
    //     './src/**/*.{js,jsx}',
    //   ],
    //   // variables: true,
    //   // fontFace: true,
    //   // keyframes: true,
    //   safelist: {
    //     standard: [/:focus$/],
    //     // deep: [],
    //     // greedy: [/yellow$/]
    //   }
    // }),

  ]
};

if (process.env.NODE_ENV === 'production') {
  postcssConfig.plugins.push(

    // https://github.com/cssnano/cssnano
    require('cssnano')({
      // use the safe preset so that it doesn't
      // mutate or remove code from our css
      preset: 'default',
    })
  );
}

module.exports = postcssConfig;

