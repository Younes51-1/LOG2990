export const options = {
    config: { routeOne: '/config', btnOne: 'Supprimer', routeTwo: '/config', btnTwo: 'Réinitialiser' },
    selection: { routeOne: '/game', btnOne: 'Jouer', routeTwo: '/game', btnTwo: 'Jouer' },
};

export enum PageKeys {
    Config = 'config',
    Selection = 'selection',
}

export const slideConfig = {
    slidesToShow: 4,
    slidesToScroll: 4,
    lazyLoad: 'ondemand',
    cssEase: 'linear',
    dots: true,
    appendArrows: 'ngx-slick-carousel',
    infinite: false,
};
