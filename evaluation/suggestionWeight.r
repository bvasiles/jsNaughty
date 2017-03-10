#Given a dataframe and a list of strings in 1 to 1 map with the
#columns of data, with each being "base", "log", "thres", or "bool.
#return a new dataframe with each column transformed by one of the 4
#functions.   "base" means we use the value in data as is.
#"log" means we transform it by log(var + .01), "thres" means we use 0 if its
# == 1 and 1 otherwise, and "bool" means we convert TRUE/FALSE to 1/0
transformData <- function(data, transform)
{
  newData = data
  #Apply the transforms to each column in a copy
  for(i in c(1:ncol(data)))
  {
    if(transform[i] == "log")
    {
      newData[,i] = log(newData[,i] + .01)
    }
    else if(transform[i] == "thres")
    {
      newData[,i] = as.numeric(newData[,i] > 1)
    }
    else if(transform[i] == "bool")
    {
      newData[,i] = as.integer(as.logical(newData[,i]))
    }
    #base is default, requires us to do nothing.
  }
  return(newData)
}

#Given a dataframe and a model built on columns from the (or possibly a subset of)
#dataframe, and then a set of indicies of coefficients the model we wish to use.
#a set of corresponding indicies for columns in data that correspond to the coefficient
#indicies, and a third corresponding list of transformations where a transform is one
#of 3 strings: "base", "log", "thres". "base" means we use the value in data as is.
#"log" means we transform it by log(var + .01), and "thres" means we use 0 if its
# == 1 and 1 otherwise.
#If the model is Null, then indicies should be a list of 1 column in the data
#that will serve as the "weight"
calculateWeight <- function(data, model, coefficients, indicies, transform)
{
  if(is.null(model))
  {
    return(data[,indicies])
  }
  else
  {
    m_odds = exp(cbind(Odds=coef(model), confint(model)))
    weights = m_odds[coefficients,1]
    #Something like this: weights * transform(data[indicies])
    
    weightCol =  as.matrix(transformData(data[,indicies], transform)) %*% weights#Transform the subset somehow...
    return(weightCol)
  }
}

calculateWeightLog <- function(data, model, coefficients, indicies, transform)
{
  if(is.null(model))
  {
    return(data[,indicies])
  }
  else
  {
    weights = coef(lmh4)[coefficients]
    #Something like this: weights * transform(data[indicies])
    
    weightCol =  as.matrix(transformData(data[,indicies], transform)) %*% weights#Transform the subset somehow...
    return(weightCol)
  }
}



#Experiments:
# lmh4 <- glm(exact_match ~ log(lines_on + .01) + (max_on_one_line > 1) + external_def + 
#               (external_use > 1) + (for_use > 1) + literal_def + (literal_use > 1) + 
#               max_line_length  + (lines_suggested_for > 1) + 
#               (length > 1) + camel_case + underscore + dollar_sign + ave_log_prob +
#               max_gain, data = bs_hr2, family="binomial")
# 
# #Current best for prediction
# lmh4 <- glm(exact_match ~ (lines_suggested_for > 1) + 
#               (length > 1) + camel_case + underscore + dollar_sign + ave_log_drop + max_gain, data = bs_hr2, family="binomial")
# #New best...
# lmh4 <- glm(exact_match ~ lines_suggested_for  + 
#               (length > 1) + camel_case + underscore + dollar_sign + ave_log_drop + ave_log_prob, data = bs_hr2, family="binomial")
# 
# lmh4 <- glm(exact_match ~ lines_suggested_for  + 
#               (length > 1) + ave_log_drop + ave_log_prob, data = bs_hr2, family="binomial")
# 
# 
# 
# lmh4 <- glm(exact_match ~ (lines_suggested_for > 1) + 
#               (length > 1) + ave_log_drop + max_gain, data = bs_hr2, family="binomial")
# 
# lmh4 <- glm(exact_match ~ (lines_suggested_for > 1) + 
#               (length > 1) + max_gain, data = bs_hr2, family="binomial")
# 
# 
# lmh4_odds <- exp(cbind(Odds=coef(lmh4), confint(lmh4)))
# summary(lmh4)
# pR2(lmh4)
# vif(lmh4)
# anova(lmh4)
# 
# #Weight building
# 
# #1. Ave log prob based.
# s_hr$base_weight <- calculateWeight(s_hr, NULL, c(), c("ave_log_prob") ,c())
# 
# #2. lmh4 based.
# transforms <- c("thres", "thres", "base")
# #test <- s_hr[,c("lines_suggested_for", "length", "max_gain")]
# #t2 <- transformData(test, transforms)
# #Full version... (best, but still worse than best_b...)
# transforms <- c("log", "thres", "bool", "thres", "thres", "bool", "thres", "base", "thres", "thres", "bool", "bool", "bool", "base" ,"base")
# s_hr$model4_weight <- calculateWeight(s_hr, lmh4, c(2:16), c("lines_on","max_on_one_line", "external_def", "external_use", "for_use", "literal_def", "literal_use", "max_line_length", "lines_suggested_for", "length", "camel_case", "underscore", "dollar_sign", "ave_log_prob","max_gain"), transforms)
# #Just straight up coef version...
# s_hr$model4_weight <- calculateWeightLog(s_hr, lmh4, c(2:16), c("lines_on","max_on_one_line", "external_def", "external_use", "for_use", "literal_def", "literal_use", "max_line_length", "lines_suggested_for", "length", "camel_case", "underscore", "dollar_sign", "ave_log_prob","max_gain"), transforms)
# 
# #Just suggestion features... (name features have no weight in determing which to pick...)
# transforms <- c("base","thres", "bool", "bool", "bool", "base" ,"base") #Current best...
# 
# transforms <- c("thres","thres", "bool", "bool", "bool", "base" ,"base") 
# s_hr$model4_weight <- calculateWeightLog(s_hr, lmh4, c(2:8), c("lines_suggested_for", "length", "camel_case", "underscore", "dollar_sign", "ave_log_drop","max_gain"), transforms)
# s_hr$model4_weight <- calculateWeightLog(s_hr, lmh4, c(2:8), c("lines_suggested_for", "length", "camel_case", "underscore", "dollar_sign", "ave_log_drop","ave_log_prob"), transforms)
# 
# #No simple name features
# transforms <- c("base","thres", "base" ,"base")
# s_hr$model4_weight <- calculateWeightLog(s_hr, lmh4, c(2:5), c("lines_suggested_for", "length", "ave_log_drop","max_gain"), transforms)
# 
# #Current best...
# s_hr$model4_weight <- calculateWeightLog(s_hr, lmh4, c(2:5), c("lines_suggested_for", "length", "ave_log_drop","ave_log_prob"), transforms)
# 
# 
# transforms <- c("thres", "thres", "base")
# 
# #Subset of full
# s_hr$model4_weight <- calculateWeight(s_hr, lmh4, c(10,11,16), c("lines_suggested_for", "length", "max_gain"), transforms)
# s_hr$model4_weight <- calculateWeightLog(s_hr, lmh4, c(10,11,16), c("lines_suggested_for", "length", "max_gain"), transforms)
# 
# 
# 
# #Just those 3... (Actually slightly better than base...)
# s_hr$model4_weight <- calculateWeight(s_hr, lmh4, c(2,3,4), c("lines_suggested_for", "length", "max_gain"), transforms)
# s_hr$model4_weight <- calculateWeightLog(s_hr, lmh4, c(2,3,4), c("lines_suggested_for", "length", "max_gain"), transforms)
# #Alternate versions
# 
# top_base <- sqldf("SELECT MAX(base_weight) as base_weight, var_id FROM s_hr GROUP BY var_id")
# top_4 <- sqldf("SELECT MAX(model4_weight) as model4_weight, var_id FROM s_hr GROUP BY var_id")
# 
# #We need to select one where there are duplicate best matches by the model?
# best_b <- sqldf("SELECT s_hr.* FROM s_hr INNER JOIN top_base on (s_hr.base_weight = top_base.base_weight and s_hr.var_id = top_base.var_id)")
# best_4 <- sqldf("SELECT s_hr.* FROM s_hr INNER JOIN top_4 on (s_hr.model4_weight = top_4.model4_weight and s_hr.var_id = top_4.var_id)")
# 
# table(best_b$exact_match)
# table(best_4$exact_match)
