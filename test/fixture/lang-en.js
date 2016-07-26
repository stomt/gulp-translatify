angular
  .module('app')
  .config(TranslationEnglish);

function TranslationEnglish($translateProvider) {
  $translateProvider
    .translations('en', {
      'STOMT_BECAUSE': 'because',
      'STOMT_WOULD': 'would'
    });
}
