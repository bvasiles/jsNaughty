#From the stats.r file we want to produce 3 plots:
#1) a comparison boxplot between the three different consistency measures with and without
#hashing. The no hash and hash boxplots (three each) should be in different colors.
#2) a comparison boxplot between our best measure, jsnice, and their mixed equivalent.
#3) a scatterplot showing the complementary nature of the two methods


#Also, this should have on the wilcox and cohensd D tests for these plots.

library(ggplot2)
library(lsr)
library(car)
library(reshape2)

stats_nomix <- read.csv("~/jsnaughty/evaluation/stats_nomix.csv", sep=";")
stats_mix <- read.csv("~/jsnaughty/evaluation/stats_mix.csv", sep=";")

#1)
boxplot(cbind(stats_nomix[,c("hash_def_one_renaming_freqlen", "hash_def_one_renaming_lm", 
                       "hash_def_one_renaming_logmodel", "no_renaming_freqlen", 
                       "no_renaming_lm", "no_renaming_logmodel")])/stats_nomix[,c("num_loc_names")], 
        las=2, ylab=paste("% names recovered -", nrow(stats_nomix), "files"))

#ggplot version with colors!
subset1 <- cbind(stats_nomix[,c("hash_def_one_renaming_freqlen", "hash_def_one_renaming_lm", 
                      "hash_def_one_renaming_logmodel", "no_renaming_freqlen", 
                      "no_renaming_lm", "no_renaming_logmodel")])/stats_nomix[,c("num_loc_names")]
colnames(subset1) <- c("Freq (Hash)", "LM (Hash)", "Model (Hash)", "Freq", "LM", "Model")
#Want to melt the data so we have two labels (one for each of the 6), and one for colors.
b_1 <- melt(subset1)

b_1$Hashed <- b_1$variable == "Freq (Hash)" |  b_1$variable == "LM (Hash)"  |  b_1$variable == "Model (Hash)"
c_plot <- ggplot(b_1, aes(x = variable, y = value, color = Hashed)) + geom_boxplot() + ggtitle("File level accuracy with and without hashes by selection technique") + xlab("Selection technique") + ylab(paste("% names recovered -", nrow(stats_nomix), "files"))
ggsave(c_plot, file = "~/jsnaughty/evaluation/Plots/consistencyBoxplot.png")

#2)
subset2 <- cbind(stats_mix[,c("hash_def_one_renaming_logmodel", "n2p")])/stats_mix[,c("num_loc_names")]
colnames(subset2) <- c("Blended Model", "JSNice")
subset3 <- cbind(stats_nomix[,c("hash_def_one_renaming_logmodel", "n2p")])/stats_nomix[,c("num_loc_names")]
colnames(subset3) <- c("Autonym", "JSNice")
subset3$file <- stats_nomix$file

subset2$file <- stats_mix$file
subset2 <- cbind(subset2[,c("file","Blended Model")])
subset2 <- merge(subset3, subset2, by = c("file"))

b_2 <- melt(subset2)
mix_plot <- ggplot(b_2, aes(variable, y = value, color = variable))+ geom_boxplot() + ggtitle("File level accuracy for JSnice, Autonym, and Blended techniques") + xlab("Renaming technique") + ylab(paste("% names recovered -", nrow(stats_nomix), "files"))
ggsave(mix_plot, file = "~/jsnaughty/evaluation/Plots/jsniceAndBlendBoxplot.png")

#3)#Bogdan's start point:
ggplot(data=stats,aes(hash_def_one_renaming_logmodel/num_loc_names,n2p/num_loc_names))+
  geom_hex()+
  xlab("Autonym")+
  ylab("JSNice")+ 
  geom_abline(slope = 1)

