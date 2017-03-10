sanity.300k <- read.table("~/workspace2/deobfuscator/data/sanity.300k.updated.csv", sep=";", quote="\"")


library(readr)
suggestions <- read_delim("~/workspace2/deobfuscator/data/suggestion_model.v15.csv", 
                          ";", escape_double = FALSE, col_names = FALSE)
names(suggestions) = c("file", "orig_name", "r_strategy", "mini_name", 
                       "keyLine", "keyToken", "sugg_name", "jsn_name", 
                       "numLines", "maxLine", "externalDef", "usageExternal", 
                       "usedInFor", "usedInWhile", "literalDef", "usageLiteral", 
                       "maxLengthLine", "aveLineLength", "linesSuggested",
                       "len", "hasCamelCase", "underScore", "dollarSign",
                       "aveLogProb", "aveLogDrop", "minGain", "maxGain")
head(suggestions)
nrow(suggestions)

sh = subset(suggestions, r_strategy=="hash_def_one_renaming")
nrow(sh)
head(sh)

sh$match = sh$orig_name==sh$sugg_name
sh$jsn_match = sh$orig_name==sh$jsn_name


shf = subset(sh, aveLogProb>=-80 & numLines<=20 & len<=20 & maxGain>=-40)

shm = subset(shf, match)
nrow(shm)
# head(shm)

shn = subset(shf, !match)
nrow(shn)
# head(shn)

# boxplot(shm$len, shn$len, names=c("match","non-match"), log="y")


sh1 = subset(shm, !jsn_match)
nrow(sh1)
# head(sh1)

sh2 = subset(shm, jsn_match)
nrow(sh2)

# boxplot(sh1$len, sh2$len, shn$len, names=c("Naughty","Nice","Neither"), log="y")
# boxplot(sh1$linesSuggested, sh2$linesSuggested, shn$linesSuggested, names=c("Naughty","Nice","Neither"), log="y")
# boxplot(sh1$aveLineLength, sh2$aveLineLength, shn$aveLineLength, names=c("Naughty","Nice","Neither"), log="y")
# boxplot(sh1$aveLogProb, sh2$aveLogProb, shn$aveLogProb, names=c("Naughty","Nice","Neither"))
# boxplot(sh1$aveLogDrop, sh2$aveLogDrop, shn$aveLogDrop, names=c("Naughty","Nice","Neither"))
# boxplot(sh1$maxGain, sh2$maxGain, shn$maxGain, names=c("Naughty","Nice","Neither"))
# boxplot(sh1$minGain, sh2$minGain, shn$minGain, names=c("Naughty","Nice","Neither"))
# boxplot(sh1$usageExternal, sh2$usageExternal, shn$usageExternal, names=c("Naughty","Nice","Neither"))

shn.sample = shn[sample(nrow(shn), nrow(shm)), ]
nrow(shn.sample)

t = rbind(shm, shn.sample)
nrow(t)

formula = match ~ (len>1) + log(numLines) + (linesSuggested>1) + (maxLine>1) + 
  externalDef + (usedInFor>0) + literalDef + (usageLiteral>0) + 
  maxLengthLine + hasCamelCase + underScore + dollarSign + aveLogProb + 
  maxGain
m = glm(formula, data=t,family=binomial())
# m = lm(formula, data=t)
vif(m)
summary(m)
pR2(m)
anova(m)
plot(m)