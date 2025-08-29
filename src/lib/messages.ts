export const messages = {
  // Authentication
  auth: {
    loading: 'Проверка аутентификации...',
    error: 'Ошибка аутентификации',
    required: 'Требуется авторизация',
    invalidData: 'Неверные данные Telegram',
    subscriptionRequired: 'Требуется подписка для доступа к контенту',
  },

  // Navigation
  nav: {
    search: 'Поиск по материалам',
    searchPlaceholder: 'Введите название или описание...',
    home: 'Главная',
    back: 'Назад',
  },

  // Content
  content: {
    loading: 'Загрузка...',
    notFound: 'Страница не найдена',
    accessDenied: 'Нет доступа',
    accessDeniedMessage: 'У вас нет доступа к этому контенту. Требуется активная подписка.',
    empty: 'Контент не найден',
    emptyMessage: 'Запрошенная страница не существует или была удалена.',
  },

  // Errors
  errors: {
    serverError: 'Ошибка сервера',
    networkError: 'Ошибка сети',
    unknownError: 'Неизвестная ошибка',
    tryAgain: 'Попробовать снова',
  },

  // States
  states: {
    loading: 'Загрузка...',
    saving: 'Сохранение...',
    processing: 'Обработка...',
    success: 'Успешно',
    error: 'Ошибка',
  },

  // Upsell
  upsell: {
    title: 'Получите полный доступ',
    description: 'Подпишитесь, чтобы получить доступ ко всему контенту и эксклюзивным материалам.',
    subscribeNow: 'Подписаться сейчас',
    loading: 'Загрузка предложения...',
  },

  // Tree View
  tree: {
    expand: 'Развернуть',
    collapse: 'Свернуть',
    loading: 'Загрузка структуры...',
    empty: 'Нет доступного контента',
  },

  // Common
  common: {
    close: 'Закрыть',
    cancel: 'Отмена',
    confirm: 'Подтвердить',
    yes: 'Да',
    no: 'Нет',
    ok: 'OK',
    save: 'Сохранить',
    delete: 'Удалить',
    edit: 'Редактировать',
    view: 'Просмотр',
    back: 'Назад',
    next: 'Далее',
    previous: 'Назад',
  },
} as const

export type Messages = typeof messages
