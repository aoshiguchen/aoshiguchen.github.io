/* global NexT: true */

NexT.utils = NexT.$u = {
  /**
   * Wrap images with fancybox support.
   */
  wrapImageWithFancyBox: function () {
    $('.content img')
      .not('[hidden]')
      .not('.group-picture img, .post-gallery img')
      .each(function () {
        var $image = $(this);
        var imageTitle = $image.attr('title');
        var $imageWrapLink = $image.parent('a');

        if ($imageWrapLink.size() < 1) {
	        var imageLink = ($image.attr('data-original')) ? this.getAttribute('data-original') : this.getAttribute('src');
          $imageWrapLink = $image.wrap('<a href="' + imageLink + '"></a>').parent('a');
        }

        $imageWrapLink.addClass('fancybox fancybox.image');
        $imageWrapLink.attr('rel', 'group');

        if (imageTitle) {
          $imageWrapLink.append('<p class="image-caption">' + imageTitle + '</p>');

          //make sure img title tag will show correctly in fancybox
          $imageWrapLink.attr('title', imageTitle);
        }
      });

    $('.fancybox').fancybox({
      helpers: {
        overlay: {
          locked: false
        }
      }
    });
  },

  lazyLoadPostsImages: function () {
    $('#posts').find('img').lazyload({
      //placeholder: '/images/loading.gif',
      effect: 'fadeIn',
      threshold : 0
    });
  },

  /**
   * Tabs tag listener (without twitter bootstrap).
   */
  registerTabsTag: function () {
    var tNav = '.tabs ul.nav-tabs ';

    // Binding `nav-tabs` & `tab-content` by real time permalink changing.
    $(function() {
      $(window).bind('hashchange', function() {
        var tHash = location.hash;
        if (tHash !== '') {
          $(tNav + 'li:has(a[href="' + tHash + '"])').addClass('active').siblings().removeClass('active');
          $(tHash).addClass('active').siblings().removeClass('active');
        }
      }).trigger('hashchange');
    });

    $(tNav + '.tab').on('click', function (href) {
      href.preventDefault();
      // Prevent selected tab to select again.
      if(!$(this).hasClass('active')){

        // Add & Remove active class on `nav-tabs` & `tab-content`.
        $(this).addClass('active').siblings().removeClass('active');
        var tActive = $(this).find('a').attr('href');
        $(tActive).addClass('active').siblings().removeClass('active');

        // Clear location hash in browser if #permalink exists.
        if (location.hash !== '') {
          history.pushState('', document.title, window.location.pathname + window.location.search);
        }
      }
    });

  },

  registerESCKeyEvent: function () {
    $(document).on('keyup', function (event) {
      var shouldDismissSearchPopup = event.which === 27 &&
        $('.search-popup').is(':visible');
      if (shouldDismissSearchPopup) {
        $('.search-popup').hide();
        $('.search-popup-overlay').remove();
        $('body').css('overflow', '');
      }
    });
  },

  registerBackToTop: function () {
    var THRESHOLD = 50;
    var $top = $('.back-to-top');

    $(window).on('scroll', function () {
      $top.toggleClass('back-to-top-on', window.pageYOffset > THRESHOLD);

      var scrollTop = $(window).scrollTop();
      var contentVisibilityHeight = NexT.utils.getContentVisibilityHeight();
      var scrollPercent = (scrollTop) / (contentVisibilityHeight);
      var scrollPercentRounded = Math.round(scrollPercent*100);
      var scrollPercentMaxed = (scrollPercentRounded > 100) ? 100 : scrollPercentRounded;
      $('#scrollpercent>span').html(scrollPercentMaxed);
    });

    $top.on('click', function () {
      $('body').velocity('scroll');
    });
  },

  /**
   * Transform embedded video to support responsive layout.
   * @see http://toddmotto.com/fluid-and-responsive-youtube-and-vimeo-videos-with-fluidvids-js/
   */
  embeddedVideoTransformer: function () {
    var $iframes = $('iframe');

    // Supported Players. Extend this if you need more players.
    var SUPPORTED_PLAYERS = [
      'www.youtube.com',
      'player.vimeo.com',
      'player.youku.com',
      'music.163.com',
      'www.tudou.com'
    ];
    var pattern = new RegExp( SUPPORTED_PLAYERS.join('|') );

    $iframes.each(function () {
      var iframe = this;
      var $iframe = $(this);
      var oldDimension = getDimension($iframe);
      var newDimension;

      if (this.src.search(pattern) > 0) {

        // Calculate the video ratio based on the iframe's w/h dimensions
        var videoRatio = getAspectRadio(oldDimension.width, oldDimension.height);

        // Replace the iframe's dimensions and position the iframe absolute
        // This is the trick to emulate the video ratio
        $iframe.width('100%').height('100%')
          .css({
            position: 'absolute',
            top: '0',
            left: '0'
          });


        // Wrap the iframe in a new <div> which uses a dynamically fetched padding-top property
        // based on the video's w/h dimensions
        var wrap = document.createElement('div');
        wrap.className = 'fluid-vids';
        wrap.style.position = 'relative';
        wrap.style.marginBottom = '20px';
        wrap.style.width = '100%';
        wrap.style.paddingTop = videoRatio + '%';
        // Fix for appear inside tabs tag.
        (wrap.style.paddingTop === '') && (wrap.style.paddingTop = '50%');

        // Add the iframe inside our newly created <div>
        var iframeParent = iframe.parentNode;
        iframeParent.insertBefore(wrap, iframe);
        wrap.appendChild(iframe);

        // Additional adjustments for 163 Music
        if (this.src.search('music.163.com') > 0) {
          newDimension = getDimension($iframe);
          var shouldRecalculateAspect = newDimension.width > oldDimension.width ||
                                        newDimension.height < oldDimension.height;

          // 163 Music Player has a fixed height, so we need to reset the aspect radio
          if (shouldRecalculateAspect) {
            wrap.style.paddingTop = getAspectRadio(newDimension.width, oldDimension.height) + '%';
          }
        }
      }
    });

    function getDimension($element) {
      return {
        width: $element.width(),
        height: $element.height()
      };
    }

    function getAspectRadio(width, height) {
      return height / width * 100;
    }
  },

  /**
   * Add `menu-item-active` class name to menu item
   * via comparing location.path with menu item's href.
   */
  addActiveClassToMenuItem: function () {
    var path = window.location.pathname;
    path = path === '/' ? path : path.substring(0, path.length - 1);
    $('.menu-item a[href^="' + path + '"]:first').parent().addClass('menu-item-active');
  },

  hasMobileUA: function () {
    var nav = window.navigator;
    var ua = nav.userAgent;
    var pa = /iPad|iPhone|Android|Opera Mini|BlackBerry|webOS|UCWEB|Blazer|PSP|IEMobile|Symbian/g;

    return pa.test(ua);
  },

  isTablet: function () {
    return window.screen.width < 992 && window.screen.width > 767 && this.hasMobileUA();
  },

  isMobile: function () {
    return window.screen.width < 767 && this.hasMobileUA();
  },

  isDesktop: function () {
    return !this.isTablet() && !this.isMobile();
  },

  /**
   * Escape meta symbols in jQuery selectors.
   *
   * @param selector
   * @returns {string|void|XML|*}
   */
  escapeSelector: function (selector) {
    return selector.replace(/[!"$%&'()*+,.\/:;<=>?@[\\\]^`{|}~]/g, '\\$&');
  },

  displaySidebar: function () {
    if (!this.isDesktop() || this.isPisces() || this.isGemini()) {
      return;
    }
    $('.sidebar-toggle').trigger('click');
  },

  isMist: function () {
    return CONFIG.scheme === 'Mist';
  },

  isPisces: function () {
    return CONFIG.scheme === 'Pisces';
  },

  isGemini: function () {
    return CONFIG.scheme === 'Gemini';
  },

  getScrollbarWidth: function () {
    var $div = $('<div />').addClass('scrollbar-measure').prependTo('body');
    var div = $div[0];
    var scrollbarWidth = div.offsetWidth - div.clientWidth;

    $div.remove();

    return scrollbarWidth;
  },

  getContentVisibilityHeight: function () {
    var docHeight = $('#content').height(),
        winHeight = $(window).height(),
        contentVisibilityHeight = (docHeight > winHeight) ? (docHeight - winHeight) : ($(document).height() - winHeight);
    return contentVisibilityHeight;
  },

  getSidebarb2tHeight: function () {
    //var sidebarb2tHeight = (CONFIG.sidebar.b2t) ? document.getElementsByClassName('back-to-top')[0].clientHeight : 0;
    var sidebarb2tHeight = (CONFIG.sidebar.b2t) ? $('.back-to-top').height() : 0;
    //var sidebarb2tHeight = (CONFIG.sidebar.b2t) ? 24 : 0;
    return sidebarb2tHeight;
  },

  getSidebarSchemePadding: function () {
    var sidebarNavHeight = ($('.sidebar-nav').css('display') == 'block') ? $('.sidebar-nav').outerHeight(true) : 0,
        sidebarInner = $('.sidebar-inner'),
        sidebarPadding = sidebarInner.innerWidth() - sidebarInner.width(),
        sidebarSchemePadding = this.isPisces() || this.isGemini() ?
          ((sidebarPadding * 2) + sidebarNavHeight + (CONFIG.sidebar.offset * 2) + this.getSidebarb2tHeight()) :
          ((sidebarPadding * 2) + (sidebarNavHeight / 2));
    return sidebarSchemePadding;
  }

  /**
   * Affix behaviour for Sidebar.
   *
   * @returns {Boolean}
   */
//  needAffix: function () {
//    return this.isPisces() || this.isGemini();
//  }
};

$(document).ready(function () {

  initSidebarDimension();

  /**
   * Init Sidebar & TOC inner dimensions on all pages and for all schemes.
   * Need for Sidebar/TOC inner scrolling if content taller then viewport.
   */
  function initSidebarDimension () {
    var updateSidebarHeightTimer;

    $(window).on('resize', function () {
      updateSidebarHeightTimer && clearTimeout(updateSidebarHeightTimer);

      updateSidebarHeightTimer = setTimeout(function () {
        var sidebarWrapperHeight = document.body.clientHeight - NexT.utils.getSidebarSchemePadding();

        updateSidebarHeight(sidebarWrapperHeight);
      }, 0);
    });

    // Initialize Sidebar & TOC Width.
    var scrollbarWidth = NexT.utils.getScrollbarWidth();
      if ($('.sidebar-panel').height() > (document.body.clientHeight - NexT.utils.getSidebarSchemePadding())) {
        $('.site-overview').css('width', 'calc(100% + ' + scrollbarWidth + 'px)');
      }
    $('.post-toc').css('width', 'calc(100% + ' + scrollbarWidth + 'px)');

    // Initialize Sidebar & TOC Height.
    updateSidebarHeight(document.body.clientHeight - NexT.utils.getSidebarSchemePadding());
  }

  function updateSidebarHeight (height) {
    height = height || 'auto';
    $('.site-overview, .post-toc').css('max-height', height);
  }

});


//自定义js函数
me = {};
NexT.me = me;

function addScriptTag(src) {
    var script = document.createElement("script");
    script.setAttribute("type", "text/javascript");
    script.src = src;
    document.body.appendChild(script);
}

function getShortUrlCallback(data){
  console.log('short url:',data.url);
  if(data.url){
    paste(data.url);
  }else{
    console.log('req error:',data.err);
    // paste(data.err);
  }
}

function paste(text){
  console.log('paste',text);
  if(!prompt("点击确定，或者按Ctrl+C复制链接",text)){
    return;
  }
  // var textarea = document.createElement("textarea");
  // textarea.style.position = 'fixed';
  // textarea.style.top = 500;
  // textarea.style.left = 500;
  // textarea.style.border = 'none';
  // textarea.style.outline = 'none';
  // textarea.style.resize = 'none';
  // textarea.style.background = 'transparent';
  // textarea.style.color = 'transparent'; 

  // textarea.value = text;
  // document.body.appendChild(textarea);
  // textarea.select();
  try {
    const msg = document.execCommand('copy') ? '成功' : '失败'; 
    console.log(msg);
  } catch (err) {
    console.log('不支持复制', err);
  }
  // document.body.removeChild(textarea);
}

me.copyPageLink = function(){
    
  var url = window.location;
  console.log('copyPageLink',url);

  addScriptTag('http://suo.im/api.php?format=jsonp&url=' + encodeURIComponent(url) + '&callback=getShortUrlCallback');

};

//缓存
me.cache = function(){
  var storage = localStorage;

  return {
    set: function(k,v){
      storage.setItem(k,v);
    },
    get: function(k){
      storage.getItem(k);
    },
    setJson: function(k,v){
      storage.setItem(k,JSON.stringify(v));
    },
    getJson: function(k){

      var val = storage.getItem(k);

      if(!val) return;
      else return JSON.parse(val);
    },
    addShortMap: function(k,v){
      var data = this.getJson('shortUrlMap') || {};
      data[k] = v;
      this.setJson('shortUrlMap',data);
    },
    getShortMap: function(){

      return this.getJson('shortUrlMap') || {};
    },
    pushBackUrl: function(url){
      //解决点击回退两次，才能回退至上一页的问题
      //用数组记录url，每进入一个新页面，添加url至数组尾部。如果要添加的URL与尾部url相同，则不添加。
      //每回退一次，取出数组尾部url跳转，并删除尾部元素。如果数组为空，则不操作。
      //数组最大长度为100
      
      if(!url)return;

      var maxCount = 100;
      var urls = this.getJson('backurls') || [];
      var backUrl = urls.length > 0 ? urls[urls.length - 1] : null;

      //if(url == backUrl) return;

      urls.push(url);

      if(urls.length > maxCount){
        urls = urls.slice(backurls.length - maxCount);
      }

      this.setJson('backurls',urls);

    },
    popBackUrl: function(){
      var urls = this.getJson('backurls') || [];
      var backUrl = urls.pop();

      this.setJson('backurls',urls);

      return backUrl;
    },
    getBackUrls: function(){
      return this.getJson('backurls') || [];
    }
  };
};

//获取短链
me.getLinkShort = function(url){

  var key = 'alexis';
  var urlhash = md5(key,url);
  var len = urlhash.length;
  var charset = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  var shortUrlList = [];

  //将加密后的串分成4段，每段4字节，对每段进行计算，一共可以生成四组短连接
  for (var i = 0; i < 4; i++) {
      var urlhashPiece = urlhash.substr(i * len / 4, len / 4);
      //将分段的位与0x3fffffff做位与，0x3fffffff表示二进制数的30个1，即30位以后的加密串都归零
      var hex = parseInt(urlhashPiece,16) & 0x3fffffff; //此处需要用到hexdec()将16进制字符串转为10进制数值型，否则运算会不正常

      var shortUrl = '';
      //生成6位短连接
      for (var j = 0; j < 6; j++) {
          //将得到的值与0x0000003d,3d为61，即charset的坐标最大值
          shortUrl += charset.charAt(hex & 0x0000003d);
          //循环完以后将hex右移5位
          hex = hex >> 5;
      }

      shortUrlList.push(shortUrl);
  }

  return shortUrlList[0];
}


if (window.history && window.history.pushState) {
  //此处配置基网址
  me.base = 'http://blog.aoshiguchen.com/';
  //me.base = 'http://localhost:4000/';
  var cache = me.cache();
  var shortMap = cache.getShortMap();

  if(document.location.href != me.base){
    var url = document.location.href.substr(me.base.length);
    //如果是短链访问，则跳转到长链
    if(shortMap[url]){
      window.location.href = me.base + shortMap[url];
    }else{
      //如果是长链，则生成对应的短链，并记录到短链、长链映射
      //然后将地址栏回显为短链
      var url = document.location.href.substr(me.base.length);
      var shortUrl = '#' + me.getLinkShort(url);

      cache.addShortMap(shortUrl,url);

      cache.pushBackUrl(window.location.href);

      history.pushState(null,null,'../../../../../../../../../../../../../' + shortUrl);
    }
  }

  // $(window).on('popstate', function () {
  //     if(document.location.href != me.base){
  //       window.history.pushState('forward', null, '#');
  //       window.history.forward(1);

  //       var backUrl = cache.popBackUrl();
  //       if(backUrl){
  //         window.location.href = backUrl;
  //       }
  //     }
  // });
}



