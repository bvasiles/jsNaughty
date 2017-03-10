library(xtable)
library(sqldf)
library(stats)


comparisonTable <- function(our_method, jsnice_method)
{
  #by_name <- merge(by_name, temp, by=c("var_id"))
  compare = sqldf("SELECT our_method.filename as filename, our_method.scope_id as scope_id, our_method.line_index as line_index, our_method.token_line_id as token_line_id, our_method.exact_match as exact_match, jsnice_method.exact_match as jsnice_match FROM our_method INNER JOIN jsnice_method ON (our_method.filename = jsnice_method.filename AND our_method.line_index = jsnice_method.line_index AND our_method.token_line_id = jsnice_method.token_line_id);")
  #For some reason its saving the jsnice results as 0/1 instead of TRUE/FALSE -> convert back.
  compare$jsnice_match = as.logical(compare$jsnice_match)
  both_true = table(compare$exact_match & compare$jsnice_match)[[2]]
  us_true = table(compare$exact_match & !compare$jsnice_match)[[2]]
  them_true = table(!compare$exact_match & compare$jsnice_match)[[2]]
  neither_true = table(!compare$exact_match & !compare$jsnice_match)[[2]]
  mix_limit <- matrix(c(both_true, them_true, us_true, neither_true),2,2, byrow=TRUE)
  print(xtable(mix_limit))
  #Mcnemar's test
  print(mcnemar.test(mix_limit))
  #Effect Size? http://stats.stackexchange.com/questions/4219/effect-size-of-mcnemars-test
  #b/c
  print(them_true/us_true)
}

