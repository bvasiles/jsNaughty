library(ggplot2)
library(reshape2)

#Draw histograms of selected columns
draw_histograms <- function(data, columns, output_file)
{
  #Draw a histogram for all numeric data.
  #Thanks to joran's answer here:
  #http://stackoverflow.com/questions/13035834/plot-every-column-in-a-data-frame-as-a-histogram-on-one-page-using-ggplot
  d <- melt(data[,columns])
  hist_plot <- ggplot(d,aes(x = value)) + 
    facet_wrap(~variable,scales = "free_x") + 
    geom_histogram()
  ggsave(filename = output_file, plot = hist_plot)
}

#Produce a heatmap of the correlation matrix of the subset of columns
#Thanks to http://www.sthda.com/english/wiki/ggplot2-quick-correlation-matrix-heatmap-r-software-and-data-visualization
cor_heatmap <- function(data, columns, output_file){
  hm <- ggplot(melt(cor(data[,columns])), aes(x=Var1, y=Var2, fill=value)) + geom_tile() + theme(axis.text.x = element_text(angle = 90, hjust = 1))
  hm
  ggsave(filename = output_file, plot=hm)
}