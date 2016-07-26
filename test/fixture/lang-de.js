angular
  .module('app')
  .config(TranslationGerman);

function TranslationGerman($translateProvider) {
  $translateProvider
    .translations('de', {
      'STOMT_BECAUSE': 'weil',
      'STOMT_WOULD': 'würde'
    });
}
