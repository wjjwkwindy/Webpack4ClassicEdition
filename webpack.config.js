const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin'); // 打包输出 HTML
const MiniCssExtractPlugin = require('mini-css-extract-plugin'); // 将 css 单独打包
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin'); // css 压缩

// CSS Tree Shaking
// PurifyCSS将帮助我们进行 CSS Tree Shaking 操作。为了能准确指明要进行 Tree Shaking 的 CSS 文件，还有 glob-all （另一个第三方库）。
// glob-all 的作用就是帮助 PurifyCSS 进行路径处理，定位要做 Tree Shaking 的路径文件。
const PurifyCSS = require('purifycss-webpack');
const glob = require('glob-all');

// 雪碧图配置，不足处：需要手动设置每个图片的宽高
let spritesConfig = {
  spritePath: './dist/images',
};

module.exports = {
  entry: {
    main: './src/index.js',
  },
  output: {
    publicPath: './',
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].bundle.js',
    chunkFilename: '[name].js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: ['babel-loader'],
      },
      {
        test: /\.(scss|css)$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
          },
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              ident: 'postcss', // 雪碧图配置
              plugins: [require('autoprefixer'), require('postcss-sprites')(spritesConfig)], // 雪碧图配置
            },
          },
          'sass-loader',
        ],
      },
      // 图片处理
      {
        test: /\.(png|jpg|jpeg|gif)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              esModule: false, // 打包后的图片地址变成了 [object Module]，原因是 5.0.0 默认将 esModule 设置为了 true，所以我们只要显式的将它再改为 false 就好了。url-loader 是对 file-loader 的封装，目的是可以使用 limit 来判断是否把图片编译成 base64 格式，最后还是会调用 file-loader，所以设置 esModule 同样有效。
              name: '[name]-[hash:5].min.[ext]',
              outputPath: 'images/', // 输出到 images 文件夹
              limit: 1000, //把小于 1kb 的文件转成 Base64 的格式。url-loader 提供了一个 limit 参数，小于 limit 字节的文件会被转为 base64，大于 limit 的使用 file-loader 进行处理，单独打包。url-loader 依赖 file-loader，url-loader 可以看作是增强版的 file-loader。
            },
          },
          {
            // 图片压缩
            loader: 'image-webpack-loader',
            options: {
              // 压缩 jpg/jpeg 图片
              mozjpeg: {
                progressive: true,
                quality: 65, // 压缩率
              },
              // 压缩 png 图片
              pngquant: {
                quality: [0.65, 0.9], // Type: Array<min: number, max: number> 最小和最大值为 0（最差）到 1（最好）
                speed: 4,
              },
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    // 打包输出 HTML
    new HtmlWebpackPlugin({
      title: '自动生成 HTML',
      minify: {
        // 压缩 HTML 文件
        removeComments: true, // 移除 HTML 中的注释
        collapseWhitespace: false, // 删除空白符与换行符
        minifyCSS: true, // 压缩内联 css
      },
      filename: 'index.html', // 生成后的文件名
      template: 'index.html', // 根据此模版生成 HTML 文件
      chunk: ['index'],
    }),
    // 将css单独打包
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[id].css',
    }),
    // css 压缩
    new OptimizeCssAssetsPlugin({
      assetNameRegExp: /\.css$/g,
      cssProcessor: require('cssnano'), //用于优化\最小化 CSS 的 CSS 处理器，默认为 cssnano
      cssProcessorOptions: { safe: true, discardComments: { removeAll: true } }, //传递给 cssProcessor 的选项，默认为{}
      canPrint: true, //布尔值，指示插件是否可以将消息打印到控制台，默认为 true
    }),
    // CSS Tree Shaking
    new PurifyCSS({
      paths: glob.sync([
        // 要做 CSS Tree Shaking 的路径文件
        path.resolve(__dirname, './*.html'), // 请注意，我们同样需要对 html 文件进行 tree shaking
        path.resolve(__dirname, './src/*.js'),
      ]),
    }),
  ],
  optimization: {
    // 分割js文件
    splitChunks: {
      chunks: 'all',
      minSize: 30000,
      maxSize: 0,
      minChunks: 1,
      maxAsyncRequests: 5,
      maxInitialRequests: 3,
      automaticNameDelimiter: '~',
      name: true,
      cacheGroups: {
        lodash: {
          name: 'lodash',
          test: /[\\/]node_modules[\\/]lodash[\\/]/,
          priority: 10,
        },
        commons: {
          name: 'commons',
          minSize: 0,
          minChunks: 2,
          priority: 5,
          reuseExistingChunk: true,
        },
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10,
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true,
        },
      },
    },
  },
};
