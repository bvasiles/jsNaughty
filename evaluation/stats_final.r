#From the stats.r file we want to produce 3 plots:
#1) a comparison boxplot between the three different consistency measures with and without
#hashing. The no hash and hash boxplots (three each) should be in different colors.
#2) a comparison boxplot between our best measure, jsnice, and their mixed equivalent. (also with global comparison)
#3) a scatterplot showing the complementary nature of the two methods


#Also, this should have on the wilcox and cohensd D tests for these plots.

library(ggplot2)
library(lsr)
library(car)
library(reshape2)
library(effsize)

rFromWilcox<-function(wilcoxModel, N){
  z<- qnorm(wilcoxModel$p.value/2)
  r<- z/ sqrt(N)
  cat(wilcoxModel$data.name, "Effect Size, r = ", r)
}
#rFromWilcox(w,2*length(subset1$`Freq`))


#Saving 9.36 x 7.07 in image
#Before hash fix
stats_mix <- read.csv("~/jsnaughty/evaluation/stats_mix_final.csv", sep=";")

stats_nomix <- read.csv("~/jsnaughty/evaluation/stats_nomix_final.csv", sep=";")


#1) (white background + shades.)
# boxplot(cbind(stats_nomix[,c("hash_def_one_renaming_freqlen", "hash_def_one_renaming_lm", 
#                        "hash_def_one_renaming_logmodel", "no_renaming_freqlen", 
#                        "no_renaming_lm", "no_renaming_logmodel")])/stats_nomix[,c("num_loc_names")], 
#         las=2, ylab=paste("% names recovered -", nrow(stats_nomix), "files"))

#ggplot version with colors!
subset1 <- cbind(stats_nomix[,c("no_renaming_freqlen", "hash_def_one_renaming_freqlen", 
                                "no_renaming_lm","hash_def_one_renaming_lm", 
                                "no_renaming_logmodel", "hash_def_one_renaming_logmodel")])/stats_nomix[,c("num_loc_names")]
colnames(subset1) <- c("Freq", "Freq (Hash)", "LM", "LM (Hash)", "Logistic", "Logistic (Hash)")
#Want to melt the data so we have two labels (one for each of the 6), and one for colors.
b_1 <- melt(subset1)

b_1$Hashed <- b_1$variable == "Freq (Hash)" |  b_1$variable == "LM (Hash)"  |  b_1$variable == "Logistic (Hash)"
c_plot <- ggplot(b_1, aes(x = variable, y = value)) + 
  geom_boxplot(aes(fill = Hashed)) +  
  scale_fill_manual(values = c("#dff4d8","#afd8b9")) + 
  theme(axis.text.x = element_text(size=20, angle = 45, hjust = 1), 
        axis.title = element_text(size=20),
        axis.text.y = element_text(size=20),
        axis.title = element_text(size=20),
        panel.grid.major.y = element_line(colour = "#f1f1f1", size = 1),
        panel.background = element_rect(fill = "white"),
        legend.position="none") + 
  #ggtitle("File level accuracy with and without hashes by selection technique") + 
  xlab("Selection technique") + 
  ylab(paste("% local names recovered -", nrow(subset1), "files"))
c_plot
ggsave(c_plot, file = "~/jsnaughty/evaluation/Plots/consistencyBoxplot.pdf", height= 7.07, width = 9.36, units = "in")
ggsave(c_plot, file = "~/jsnaughty-paper/figures/consistencyBoxplot.pdf", height=7.07, width =9.36, units = "in")
#Compare the values of the hash and no hash versions assuming the hashing is better...
wilcox.test(subset1$`Freq`, subset1$`Freq (Hash)`,paired=TRUE,alt="l")
cohen.d(subset1$`Freq`, subset1$`Freq (Hash)`, paired = TRUE)
#cohen.d(subset1$`Freq`, subset1$`Freq (Hash)`) #Test -> they are equivalent. (check)
#cohensD(subset1$`Freq`, subset1$`Freq (Hash)`)
wilcox.test(subset1$`LM`, subset1$`LM (Hash)`,paired=TRUE,alt="l")
cohen.d(subset1$`LM`, subset1$`LM (Hash)`, paired = TRUE)
#cohensD(subset1$`LM`, subset1$`LM (Hash)`)
wilcox.test(subset1$`Logistic`, subset1$`Logistic (Hash)`,paired=TRUE,alt="l")
cohen.d(subset1$`Logistic`, subset1$`Logistic (Hash)`, paired=TRUE)
#cohensD(subset1$`Model`, subset1$`Model (Hash)`)

#Compare the values of three hash method (low - mid) + (mid - high)
wilcox.test(subset1$`Freq (Hash)`, subset1$`LM (Hash)`,paired=TRUE,alt="l")
cohen.d(subset1$`Freq (Hash)`, subset1$`LM (Hash)`, paired = TRUE)
#cohensD(subset1$`Freq (Hash)`, subset1$`LM (Hash)`)

wilcox.test(subset1$`LM (Hash)`, subset1$`Logistic (Hash)`,paired=TRUE,alt="l")
cohen.d(subset1$`LM (Hash)`, subset1$`Logistic (Hash)`, paired = TRUE)
#cohensD(subset1$`LM (Hash)`, subset1$`Model (Hash)`)

#2)
subset2 <- cbind(stats_mix[,c("hash_def_one_renaming_logmodel", "n2p")])/stats_mix[,c("num_loc_names")]
#Add in globals as well.
subset2 <- cbind(subset2, (cbind(stats_mix[,c("hash_def_one_renaming_logmodel_all", "n2p_all")]))/stats_mix[,c("num_names")])
colnames(subset2) <- c("Autonymix", "JSNice", "Autonymix (All)", "JSNice (All)")
subset3 <- cbind(stats_nomix[,c("hash_def_one_renaming_logmodel", "n2p")])/stats_nomix[,c("num_loc_names")]
subset3 <- cbind(subset3, (cbind(stats_nomix[,c("hash_def_one_renaming_logmodel_all", "n2p_all")]))/stats_nomix[,c("num_names")])

colnames(subset3) <- c("Autonym", "JSNice","Autonym (All)", "JSNice (All)")
subset3$file <- stats_nomix$file

subset2$file <- stats_mix$file
subset2 <- cbind(subset2[,c("file","Autonymix", "Autonymix (All)")])
subset2 <- merge(subset3, subset2, by = c("file"))
#Reorder the columns so they are plotted like we wish.
subset2 <- subset2[,c("Autonym", "Autonym (All)", "JSNice", "JSNice (All)", "Autonymix", "Autonymix (All)")]
colnames(subset2) <- c("Autonym (Local)", "Autonym (All)", "JSNice (Local)", "JSNice (All)", "Autonymix (Local)", "Autonymix (All)")

b_2 <- melt(subset2)
mix_plot <- ggplot(b_2, aes(variable, y = value))+ 
  geom_boxplot(aes(fill = variable)) +  
  theme(axis.text.x = element_text(size=20, angle = 45, hjust = 1), 
        axis.title = element_text(size=20),
        axis.text.y = element_text(size=20),
        axis.title = element_text(size=20),
        panel.grid.major.y = element_line(colour = "#f1f1f1", size = 1),
        panel.background = element_rect(fill = "white"),
        legend.position="none") +  
  scale_fill_manual(values = c(	"#afd8b9","#f1f1f1","#ccbadd","#f1f1f1","#269441","#f1f1f1")) +
  #scale_fill_brewer(palette="Greens") + 
  #ggtitle("File level accuracy for JSnice, Autonym, and Autonymix") + 
  xlab("Renaming technique") + 
  ylab(paste("% names recovered -", nrow(subset2), "files"))
mix_plot
ggsave(mix_plot, file = "~/jsnaughty/evaluation/Plots/jsniceAndBlendBoxplot.pdf", height= 7.07, width = 9.36, units = "in")
ggsave(mix_plot, file = "~/jsnaughty-paper/figures/jsniceAndBlendBoxplot.pdf", height= 7.07, width = 9.36, units = "in")

#Temp:
#Not significant.
#wilcox.test(subset3$Autonym, subset3$JSNice, paired=TRUE)
#cohen.d(subset3$Autonym, subset3$JSNice, paired=TRUE)

wilcox.test(subset2$`Autonym (Local)`, subset2$`JSNice (Local)`, paired=TRUE)
cohen.d(subset2$`Autonym (Local)`, subset2$`JSNice (Local)`,paired=TRUE)
wilcox.test(subset2$`Autonym (Local)`, subset2$`Autonymix (Local)`, paired=TRUE, alt="l")
cohen.d(subset2$`Autonym (Local)`, subset2$`Autonymix (Local)`,paired=TRUE)
wilcox.test(subset2$`JSNice (Local)`, subset2$`Autonymix (Local)`, paired=TRUE, alt="l")
cohen.d(subset2$`JSNice (Local)`, subset2$`Autonymix (Local)`,paired=TRUE)

wilcox.test(subset2$`JSNice (All)`, subset2$`Autonymix (All)`, paired=TRUE, alt="l")
cohen.d(subset2$`JSNice (All)`, subset2$`Autonymix (All)`,paired=TRUE)

#Remove them...

no_glb <- subset2[,c("Autonym (Local)", "JSNice (Local)", "Autonymix (Local)")]
colnames(no_glb) <- c("Autonym", "JSNice", "Autonymix")

nglb <- melt(no_glb)
mix_plot2 <- ggplot(nglb, aes(variable, y = value))+ 
  geom_boxplot(aes(fill = variable)) +  
  theme(axis.text.x = element_text(size=20, angle = 45, hjust = 1), 
        axis.title = element_text(size=20),
        axis.text.y = element_text(size=20),
        axis.title = element_text(size=20),
        panel.grid.major.y = element_line(colour = "#f1f1f1", size = 1),
        panel.background = element_rect(fill = "white"),
        legend.position="none") +  
  scale_fill_manual(values = c(	"#afd8b9","#ccbadd","#269441")) +
  #scale_fill_brewer(palette="Greens") + 
  #ggtitle("File level accuracy for JSnice, Autonym, and Autonymix") + 
  xlab("Renaming technique") + 
  ylab(paste("% local names recovered -", nrow(subset2), "files"))
mix_plot2
ggsave(mix_plot2, file = "~/jsnaughty/evaluation/Plots/jsniceAndBlendBoxplotLocal.pdf", height= 7.07, width = 9.36, units = "in")
ggsave(mix_plot2, file = "~/jsnaughty-paper/figures/jsniceAndBlendBoxplotLocal.pdf", height= 7.07, width = 9.36, units = "in")



#Fix them (but not consistent with JSNice reported results... which seem to match our original ones...)

globalCountMix <- read.csv("~/jsnaughty/evaluation/globalCountMix.csv", header=FALSE, sep=";")
colnames(globalCountMix) <- c("file", "num_glb_names_fixed")
stats_mix2 <- merge(stats_mix, globalCountMix, by = c("file")) #mix should be equivalent to nomix for globals.

subset2 <- cbind(stats_mix2[,c("hash_def_one_renaming_logmodel", "n2p")])/stats_mix2[,c("num_loc_names")]


nrow(stats_mix2) #should be the same.
stats_mix2$num_names_fixed <- stats_mix2$num_loc_names + stats_mix2$num_glb_names_fixed

#Add in globals as well.
subset2 <- cbind(subset2, (cbind(stats_mix2[,c("hash_def_one_renaming_logmodel", "n2p")] + stats_mix2[,c("num_glb_names_fixed")]))/stats_mix2[,c("num_names_fixed")])


colnames(subset2) <- c("Autonymix", "JSNice", "Autonymix (All)", "JSNice (All)")

stats_nomix2  <- merge(stats_nomix, globalCountMix, by = c("file")) #mix should be equivalent to nomix for globals.
stats_nomix2$num_names_fixed <- stats_nomix2$num_loc_names + stats_nomix2$num_glb_names_fixed

subset3 <- cbind(stats_nomix2[,c("hash_def_one_renaming_logmodel", "n2p")])/stats_nomix2[,c("num_loc_names")]

#Globals
subset3 <- cbind(subset3, (cbind(stats_nomix2[,c("hash_def_one_renaming_logmodel", "n2p")] + stats_nomix2[,c("num_glb_names_fixed")]))/stats_nomix2[,c("num_names_fixed")])

colnames(subset3) <- c("Autonym", "JSNice","Autonym (All)", "JSNice (All)")
subset3$file <- stats_nomix2$file

subset2$file <- stats_mix2$file
subset2 <- cbind(subset2[,c("file","Autonymix", "Autonymix (All)")])
subset2 <- merge(subset3, subset2, by = c("file"))
#Reorder the columns so they are plotted like we wish.
subset2 <- subset2[,c("Autonym", "Autonym (All)", "JSNice", "JSNice (All)", "Autonymix", "Autonymix (All)")]
colnames(subset2) <- c("Autonym (Local)", "Autonym (All)", "JSNice (Local)", "JSNice (All)", "Autonymix (Local)", "Autonymix (All)")


glb_fix <- melt(subset2)
mix_plot3 <- ggplot(glb_fix, aes(variable, y = value))+ 
  geom_boxplot(aes(fill = variable)) +  
  theme(axis.text.x = element_text(size=20, angle = 45, hjust = 1), 
        axis.title = element_text(size=20),
        axis.text.y = element_text(size=20),
        axis.title = element_text(size=20),
        panel.grid.major.y = element_line(colour = "#f1f1f1", size = 1),
        panel.background = element_rect(fill = "white"),
        legend.position="none") +  
  scale_fill_manual(values = c(	"#afd8b9","#f1f1f1","#ccbadd","#f1f1f1","#269441","#f1f1f1")) +
  #scale_fill_brewer(palette="Greens") + 
  #ggtitle("File level accuracy for JSnice, Autonym, and Autonymix") + 
  xlab("Renaming technique") + 
  ylab(paste("% names recovered -", nrow(subset2), "files"))
mix_plot3
ggsave(mix_plot3, file = "~/jsnaughty/evaluation/Plots/jsniceAndBlendBoxplotFixed.pdf", height= 7.07, width = 9.36, units = "in")
ggsave(mix_plot3, file = "~/jsnaughty-paper/figures/jsniceAndBlendBoxplotFixed.pdf", height= 7.07, width = 9.36, units = "in")



#3)#Bogdan's start point:

non_zero <- subset3[subset3$Autonym != 0 | subset3$JSNice != 0,]
diff <- non_zero[non_zero$Autonym != 1 | non_zero$JSNice != 1,]


hex_plot <- ggplot(data=diff,aes(Autonym,JSNice))+
  geom_hex()+
  theme(axis.text.x = element_text(size=20), 
        axis.title = element_text(size=20),
        axis.text.y = element_text(size=20),
        axis.title = element_text(size=20),
        legend.text = element_text(size=20),
        legend.title = element_text(size=20),
        panel.background = element_rect(fill = "white")) + 
  #scale_fill_gradientn(colours=c("green","black"),name = "Frequency",na.value=NA) +
  scale_fill_gradientn(colors=c("#269441","black"),name = "Frequency",na.value=NA)+
  #scale_fill_gradientn(colors=c("#91d288","black"),name = "Frequency",na.value=NA)+
  xlab("Autonym File Accuracy")+
  ylab("JSNice File Accuracy")+ 
  geom_abline(slope = 1, size = 2)#+
  #ggtitle("Comparison of Autonym vs JSNice Accuracy")

ggsave(hex_plot, file = "~/jsnaughty/evaluation/Plots/hexComparisonPlot.pdf", height= 7.07, width = 9.36, units = "in")
ggsave(hex_plot, file = "~/jsnaughty-paper/figures/hexComparisonPlot.pdf", height= 7.07, width = 9.36, units = "in")
#Density comparison
d_in <- melt(subset3[,c("Autonym", "JSNice")])
colnames(d_in) <- c("Technique", "value")
density_plot <- ggplot(data =d_in, aes(x = value, group = Technique, fill = Technique)) + 
  geom_density(alpha = .3) + 
  theme(axis.text.x = element_text(size=20), 
        axis.title = element_text(size=20),
        axis.text.y = element_text(size=20),
        axis.title = element_text(size=20),
        legend.text = element_text(size=20),
        legend.title = element_text(size=20),
        panel.background = element_rect(fill = "white")) +
  ylab("Density") + 
  xlab(paste("% names recovered -", nrow(subset2), "files")) +
  #ylab(paste("% names recovered -", nrow(stats_nomix), "files")) + 
  #ggtitle("Density Plot of File Accuracy of Autonym Vs JSNice") +
  scale_fill_manual(values = c("#269441","#7647a2"))
  #scale_fill_manual(values = c("#7647a2","#00cc00"))
density_plot
ggsave(density_plot, file = "~/jsnaughty/evaluation/Plots/jsniceCompareDensity.pdf", height= 7.07, width = 9.36, units = "in")
ggsave(density_plot, file = "~/jsnaughty-paper/figures/jsniceCompareDensity.pdf", height= 7.07, width = 9.36, units = "in")
