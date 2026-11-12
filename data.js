// Собрано tools/build-site.mjs — не править руками
window.OVERLY_THEMES = [
 {
  "id": "newyear",
  "name": "Новогодняя ночь",
  "price": 0,
  "free": true,
  "description": "Минималистичная зимняя ночь: тонкая гирлянда, тёплые огоньки и снег. Алерты повисают на проводе и качаются, окна в домиках загораются по числу зрителей, на рамке вебки растут сугробы.",
  "overlays": [
   {
    "id": "alerts",
    "name": "Алерты",
    "width": 1100,
    "height": 500
   },
   {
    "id": "chat",
    "name": "Чат",
    "width": 560,
    "height": 900
   },
   {
    "id": "starting",
    "name": "Стрим скоро",
    "width": 1920,
    "height": 1080
   },
   {
    "id": "webcam",
    "name": "Рамка вебки",
    "width": 640,
    "height": 360
   },
   {
    "id": "music",
    "name": "Музыка",
    "width": 640,
    "height": 160
   },
   {
    "id": "goal",
    "name": "Цель",
    "width": 900,
    "height": 160
   }
  ],
  "events": [
   {
    "label": "Фоллов",
    "event": {
     "type": "follow",
     "name": "danila1159"
    }
   },
   {
    "label": "Подписка",
    "event": {
     "type": "sub",
     "name": "Gosha"
    }
   },
   {
    "label": "Переподписка",
    "event": {
     "type": "resub",
     "name": "hateAnime",
     "amount": 7,
     "message": "Привет, я твой подписчик"
    }
   },
   {
    "label": "Подарок",
    "event": {
     "type": "gift",
     "name": "Gosha",
     "amount": 5
    }
   },
   {
    "label": "Рейд",
    "event": {
     "type": "raid",
     "name": "kitinaaa_",
     "amount": 42
    }
   },
   {
    "label": "Битсы",
    "event": {
     "type": "bits",
     "name": "KviLBi",
     "amount": 100,
     "message": "красиво исполняет"
    }
   },
   {
    "label": "Донат",
    "event": {
     "type": "tip",
     "name": "Spasibo",
     "amount": 500,
     "message": "с наступающим!"
    }
   }
  ],
  "chat": [
   {
    "name": "danila1159",
    "login": "danila1159",
    "color": "#1E90FF",
    "badges": [
     "subscriber"
    ],
    "fragments": [
     {
      "text": "привет! как стрим? "
     },
     {
      "text": "Kappa",
      "emote": "25"
     }
    ]
   },
   {
    "name": "hateAnime",
    "login": "hateanime",
    "color": "#FF4F9A",
    "badges": [
     "moderator",
     "subscriber"
    ],
    "fragments": [
     {
      "text": "не спамим в чате, пожалуйста"
     }
    ]
   },
   {
    "name": "KviLBi",
    "login": "kvilbi",
    "color": "",
    "badges": [],
    "fragments": [
     {
      "text": "очень длинное сообщение, чтобы посмотреть, как чат переносит строки и не вылезает за край оверлея при любом размере текста "
     },
     {
      "text": "LUL",
      "emote": "425618"
     }
    ]
   }
  ]
 },
 {
  "id": "glitch",
  "name": "Glitch HUD",
  "price": 490,
  "free": false,
  "description": "Технический HUD с кислотным акцентом: текст влетает построчно со сбоем, уходит — разрезаясь полосами.",
  "overlays": [
   {
    "id": "alerts",
    "name": "Алерты",
    "width": 1100,
    "height": 460
   },
   {
    "id": "chat",
    "name": "Чат",
    "width": 560,
    "height": 900
   },
   {
    "id": "starting",
    "name": "Стрим скоро",
    "width": 1920,
    "height": 1080
   },
   {
    "id": "webcam",
    "name": "Рамка вебки",
    "width": 640,
    "height": 360
   },
   {
    "id": "music",
    "name": "Музыка",
    "width": 640,
    "height": 160
   },
   {
    "id": "goal",
    "name": "Цель",
    "width": 640,
    "height": 300
   }
  ],
  "events": [
   {
    "label": "Фоллов",
    "event": {
     "type": "follow",
     "name": "danila1159"
    }
   },
   {
    "label": "Подписка",
    "event": {
     "type": "sub",
     "name": "Gosha"
    }
   },
   {
    "label": "Переподписка",
    "event": {
     "type": "resub",
     "name": "hateAnime",
     "amount": 7,
     "message": "Привет, я твой подписчик"
    }
   },
   {
    "label": "Подарок",
    "event": {
     "type": "gift",
     "name": "Gosha",
     "amount": 5
    }
   },
   {
    "label": "Рейд",
    "event": {
     "type": "raid",
     "name": "kitinaaa_",
     "amount": 42
    }
   },
   {
    "label": "Битсы",
    "event": {
     "type": "bits",
     "name": "KviLBi",
     "amount": 100,
     "message": "красиво исполняет"
    }
   },
   {
    "label": "Донат",
    "event": {
     "type": "tip",
     "name": "Spasibo",
     "amount": 500,
     "message": "на новую вебку"
    }
   }
  ],
  "chat": [
   {
    "name": "danila1159",
    "login": "danila1159",
    "color": "#1E90FF",
    "badges": [
     "subscriber"
    ],
    "fragments": [
     {
      "text": "привет! как стрим? "
     },
     {
      "text": "Kappa",
      "emote": "25"
     }
    ]
   },
   {
    "name": "hateAnime",
    "login": "hateanime",
    "color": "#FF4F9A",
    "badges": [
     "moderator",
     "subscriber"
    ],
    "fragments": [
     {
      "text": "не спамим в чате, пожалуйста"
     }
    ]
   },
   {
    "name": "KviLBi",
    "login": "kvilbi",
    "color": "",
    "badges": [
     "vip"
    ],
    "fragments": [
     {
      "text": "очень длинное сообщение, чтобы посмотреть, как чат переносит строки и не вылезает за край оверлея при любом размере текста "
     },
     {
      "text": "LUL",
      "emote": "425618"
     }
    ]
   }
  ]
 },
 {
  "id": "lumen",
  "name": "Lumen",
  "price": 490,
  "free": false,
  "description": "Спокойный тёмный интерфейс: карточки раскрываются из светящейся полосы, всё появляется плавно и по очереди.",
  "overlays": [
   {
    "id": "alerts",
    "name": "Алерты",
    "width": 1100,
    "height": 420
   },
   {
    "id": "chat",
    "name": "Чат",
    "width": 560,
    "height": 900
   },
   {
    "id": "starting",
    "name": "Стрим скоро",
    "width": 1920,
    "height": 1080
   },
   {
    "id": "webcam",
    "name": "Рамка вебки",
    "width": 640,
    "height": 360
   },
   {
    "id": "music",
    "name": "Музыка",
    "width": 640,
    "height": 160
   },
   {
    "id": "goal",
    "name": "Цель",
    "width": 900,
    "height": 160
   }
  ],
  "events": [
   {
    "label": "Фоллов",
    "event": {
     "type": "follow",
     "name": "danila1159"
    }
   },
   {
    "label": "Подписка",
    "event": {
     "type": "sub",
     "name": "Gosha"
    }
   },
   {
    "label": "Переподписка",
    "event": {
     "type": "resub",
     "name": "hateAnime",
     "amount": 7,
     "message": "Привет, я твой подписчик"
    }
   },
   {
    "label": "Подарок",
    "event": {
     "type": "gift",
     "name": "Gosha",
     "amount": 5
    }
   },
   {
    "label": "Рейд",
    "event": {
     "type": "raid",
     "name": "kitinaaa_",
     "amount": 42
    }
   },
   {
    "label": "Битсы",
    "event": {
     "type": "bits",
     "name": "KviLBi",
     "amount": 100,
     "message": "красиво исполняет"
    }
   },
   {
    "label": "Донат",
    "event": {
     "type": "tip",
     "name": "Spasibo",
     "amount": 500,
     "message": "на новую вебку"
    }
   }
  ],
  "chat": [
   {
    "name": "danila1159",
    "login": "danila1159",
    "color": "#1E90FF",
    "badges": [
     "subscriber"
    ],
    "fragments": [
     {
      "text": "привет! как стрим? "
     },
     {
      "text": "Kappa",
      "emote": "25"
     }
    ]
   },
   {
    "name": "hateAnime",
    "login": "hateanime",
    "color": "#FF4F9A",
    "badges": [
     "moderator",
     "subscriber"
    ],
    "fragments": [
     {
      "text": "не спамим в чате, пожалуйста"
     }
    ]
   },
   {
    "name": "KviLBi",
    "login": "kvilbi",
    "color": "",
    "badges": [],
    "fragments": [
     {
      "text": "очень длинное сообщение, чтобы посмотреть, как чат переносит строки и не вылезает за край оверлея при любом размере текста "
     },
     {
      "text": "LUL",
      "emote": "425618"
     }
    ]
   }
  ]
 },
 {
  "id": "gum",
  "name": "Жвачка",
  "price": 0,
  "free": true,
  "description": "Ярко и мило: цветная капсула с пузырьками влетает под углом, растягивается и становится белой карточкой. Всё покачивается в объёме. Четыре палитры или свои цвета.",
  "overlays": [
   {
    "id": "alerts",
    "name": "Алерты",
    "width": 900,
    "height": 360
   },
   {
    "id": "chat",
    "name": "Чат",
    "width": 520,
    "height": 820
   },
   {
    "id": "starting",
    "name": "Стрим скоро",
    "width": 1920,
    "height": 1080
   },
   {
    "id": "webcam",
    "name": "Рамка вебки",
    "width": 640,
    "height": 360
   },
   {
    "id": "music",
    "name": "Музыка",
    "width": 640,
    "height": 160
   },
   {
    "id": "goal",
    "name": "Цель",
    "width": 900,
    "height": 160
   }
  ],
  "events": [
   {
    "label": "Фоллов",
    "event": {
     "type": "follow",
     "name": "danila1159"
    }
   },
   {
    "label": "Подписка",
    "event": {
     "type": "sub",
     "name": "Gosha"
    }
   },
   {
    "label": "Переподписка",
    "event": {
     "type": "resub",
     "name": "hateAnime",
     "amount": 7,
     "message": "Привет, я твой подписчик"
    }
   },
   {
    "label": "Подарок",
    "event": {
     "type": "gift",
     "name": "Gosha",
     "amount": 5
    }
   },
   {
    "label": "Рейд",
    "event": {
     "type": "raid",
     "name": "kitinaaa_",
     "amount": 42
    }
   },
   {
    "label": "Битсы",
    "event": {
     "type": "bits",
     "name": "KviLBi",
     "amount": 100,
     "message": "красиво исполняет"
    }
   },
   {
    "label": "Донат",
    "event": {
     "type": "tip",
     "name": "Spasibo",
     "amount": 500,
     "message": "на новую вебку"
    }
   }
  ],
  "chat": [
   {
    "name": "danila1159",
    "login": "danila1159",
    "color": "#1E90FF",
    "badges": [
     "subscriber"
    ],
    "fragments": [
     {
      "text": "привет! как стрим? "
     },
     {
      "text": "Kappa",
      "emote": "25"
     }
    ]
   },
   {
    "name": "hateAnime",
    "login": "hateanime",
    "color": "#FF4F9A",
    "badges": [
     "moderator",
     "subscriber"
    ],
    "fragments": [
     {
      "text": "не спамим в чате, пожалуйста"
     }
    ]
   },
   {
    "name": "KviLBi",
    "login": "kvilbi",
    "color": "",
    "badges": [
     "vip"
    ],
    "fragments": [
     {
      "text": "очень длинное сообщение, чтобы посмотреть, как чат переносит строки и не вылезает за край оверлея при любом размере текста "
     },
     {
      "text": "LUL",
      "emote": "425618"
     }
    ]
   }
  ]
 },
 {
  "id": "matrix",
  "name": "Матрица",
  "price": 490,
  "free": false,
  "description": "Чёрный экран, неоновая сетка и каркасный глобус. Плашка мигает, линия прочерчивается, ник поднимается контуром и загорается. Сцены открываются линзой.",
  "overlays": [
   {
    "id": "alerts",
    "name": "Алерты",
    "width": 900,
    "height": 360
   },
   {
    "id": "chat",
    "name": "Чат",
    "width": 520,
    "height": 820
   },
   {
    "id": "starting",
    "name": "Стрим скоро",
    "width": 1920,
    "height": 1080
   },
   {
    "id": "webcam",
    "name": "Рамка вебки",
    "width": 640,
    "height": 360
   },
   {
    "id": "music",
    "name": "Музыка",
    "width": 640,
    "height": 160
   },
   {
    "id": "goal",
    "name": "Цель",
    "width": 900,
    "height": 160
   }
  ],
  "events": [
   {
    "label": "Фоллов",
    "event": {
     "type": "follow",
     "name": "danila1159"
    }
   },
   {
    "label": "Подписка",
    "event": {
     "type": "sub",
     "name": "Gosha"
    }
   },
   {
    "label": "Переподписка",
    "event": {
     "type": "resub",
     "name": "hateAnime",
     "amount": 7,
     "message": "Привет, я твой подписчик"
    }
   },
   {
    "label": "Подарок",
    "event": {
     "type": "gift",
     "name": "Gosha",
     "amount": 5
    }
   },
   {
    "label": "Рейд",
    "event": {
     "type": "raid",
     "name": "kitinaaa_",
     "amount": 42
    }
   },
   {
    "label": "Битсы",
    "event": {
     "type": "bits",
     "name": "KviLBi",
     "amount": 100,
     "message": "красиво исполняет"
    }
   },
   {
    "label": "Донат",
    "event": {
     "type": "tip",
     "name": "Spasibo",
     "amount": 500,
     "message": "на новую вебку"
    }
   }
  ],
  "chat": [
   {
    "name": "danila1159",
    "login": "danila1159",
    "color": "#1E90FF",
    "badges": [
     "subscriber"
    ],
    "fragments": [
     {
      "text": "привет! как стрим? "
     },
     {
      "text": "Kappa",
      "emote": "25"
     }
    ]
   },
   {
    "name": "hateAnime",
    "login": "hateanime",
    "color": "#FF4F9A",
    "badges": [
     "moderator",
     "subscriber"
    ],
    "fragments": [
     {
      "text": "не спамим в чате, пожалуйста"
     }
    ]
   },
   {
    "name": "KviLBi",
    "login": "kvilbi",
    "color": "",
    "badges": [
     "vip"
    ],
    "fragments": [
     {
      "text": "очень длинное сообщение, чтобы посмотреть, как чат переносит строки и не вылезает за край оверлея при любом размере текста "
     },
     {
      "text": "LUL",
      "emote": "425618"
     }
    ]
   }
  ]
 },
 {
  "id": "sumi",
  "name": "Тушь",
  "price": 490,
  "free": false,
  "description": "Японская тушь: чёрный мазок кистью прописывается слева направо, текст проступает сквозь него, сверху встаёт красное солнце и летят брызги. Сцены — пейзаж суми-э с горами, сакурой и падающими лепестками.",
  "overlays": [
   {
    "id": "alerts",
    "name": "Алерты",
    "width": 900,
    "height": 360
   },
   {
    "id": "chat",
    "name": "Чат",
    "width": 520,
    "height": 820
   },
   {
    "id": "starting",
    "name": "Стрим скоро",
    "width": 1920,
    "height": 1080
   },
   {
    "id": "webcam",
    "name": "Рамка вебки",
    "width": 640,
    "height": 360
   },
   {
    "id": "music",
    "name": "Музыка",
    "width": 640,
    "height": 160
   },
   {
    "id": "goal",
    "name": "Цель",
    "width": 900,
    "height": 160
   }
  ],
  "events": [
   {
    "label": "Фоллов",
    "event": {
     "type": "follow",
     "name": "danila1159"
    }
   },
   {
    "label": "Подписка",
    "event": {
     "type": "sub",
     "name": "Gosha"
    }
   },
   {
    "label": "Переподписка",
    "event": {
     "type": "resub",
     "name": "hateAnime",
     "amount": 7,
     "message": "Привет, я твой подписчик"
    }
   },
   {
    "label": "Подарок",
    "event": {
     "type": "gift",
     "name": "Gosha",
     "amount": 5
    }
   },
   {
    "label": "Рейд",
    "event": {
     "type": "raid",
     "name": "kitinaaa_",
     "amount": 42
    }
   },
   {
    "label": "Битсы",
    "event": {
     "type": "bits",
     "name": "KviLBi",
     "amount": 100,
     "message": "красиво исполняет"
    }
   },
   {
    "label": "Донат",
    "event": {
     "type": "tip",
     "name": "Spasibo",
     "amount": 500,
     "message": "на новую вебку"
    }
   }
  ],
  "chat": [
   {
    "name": "danila1159",
    "login": "danila1159",
    "color": "#1E90FF",
    "badges": [
     "subscriber"
    ],
    "fragments": [
     {
      "text": "привет! как стрим? "
     },
     {
      "text": "Kappa",
      "emote": "25"
     }
    ]
   },
   {
    "name": "hateAnime",
    "login": "hateanime",
    "color": "#FF4F9A",
    "badges": [
     "moderator",
     "subscriber"
    ],
    "fragments": [
     {
      "text": "не спамим в чате, пожалуйста"
     }
    ]
   },
   {
    "name": "KviLBi",
    "login": "kvilbi",
    "color": "",
    "badges": [
     "vip"
    ],
    "fragments": [
     {
      "text": "очень длинное сообщение, чтобы посмотреть, как чат переносит строки и не вылезает за край оверлея при любом размере текста "
     },
     {
      "text": "LUL",
      "emote": "425618"
     }
    ]
   }
  ]
 },
 {
  "id": "witching",
  "name": "Ведьмин час",
  "price": 0,
  "free": true,
  "description": "Хэллоуин: из светящегося тумана вылезают призрак, рука зомби, череп и тыква; кривые рамки со слизью, ночные сцены с луной и летучими мышами.",
  "overlays": [
   {
    "id": "alerts",
    "name": "Алерты",
    "width": 1100,
    "height": 500
   },
   {
    "id": "chat",
    "name": "Чат",
    "width": 560,
    "height": 900
   },
   {
    "id": "starting",
    "name": "Стрим скоро",
    "width": 1920,
    "height": 1080
   },
   {
    "id": "webcam",
    "name": "Рамка вебки",
    "width": 640,
    "height": 360
   },
   {
    "id": "music",
    "name": "Музыка",
    "width": 640,
    "height": 160
   },
   {
    "id": "goal",
    "name": "Цель",
    "width": 900,
    "height": 160
   }
  ],
  "events": [
   {
    "label": "Фоллов",
    "event": {
     "type": "follow",
     "name": "danila1159"
    }
   },
   {
    "label": "Подписка",
    "event": {
     "type": "sub",
     "name": "Gosha"
    }
   },
   {
    "label": "Переподписка",
    "event": {
     "type": "resub",
     "name": "hateAnime",
     "amount": 7,
     "message": "Привет, я твой подписчик"
    }
   },
   {
    "label": "Подарок",
    "event": {
     "type": "gift",
     "name": "Gosha",
     "amount": 5
    }
   },
   {
    "label": "Рейд",
    "event": {
     "type": "raid",
     "name": "kitinaaa_",
     "amount": 42
    }
   },
   {
    "label": "Битсы",
    "event": {
     "type": "bits",
     "name": "KviLBi",
     "amount": 100,
     "message": "красиво исполняет"
    }
   },
   {
    "label": "Донат",
    "event": {
     "type": "tip",
     "name": "Spasibo",
     "amount": 500,
     "message": "на новую вебку"
    }
   }
  ],
  "chat": [
   {
    "name": "danila1159",
    "login": "danila1159",
    "color": "#1E90FF",
    "badges": [
     "subscriber"
    ],
    "fragments": [
     {
      "text": "привет! как стрим? "
     },
     {
      "text": "Kappa",
      "emote": "25"
     }
    ]
   },
   {
    "name": "hateAnime",
    "login": "hateanime",
    "color": "#FF4F9A",
    "badges": [
     "moderator",
     "subscriber"
    ],
    "fragments": [
     {
      "text": "не спамим в чате, пожалуйста"
     }
    ]
   },
   {
    "name": "KviLBi",
    "login": "kvilbi",
    "color": "",
    "badges": [],
    "fragments": [
     {
      "text": "очень длинное сообщение, чтобы посмотреть, как чат переносит строки и не вылезает за край оверлея при любом размере текста "
     },
     {
      "text": "LUL",
      "emote": "425618"
     }
    ]
   }
  ]
 }
];
