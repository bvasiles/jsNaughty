import time
from django.shortcuts import get_object_or_404, render
from django.http import HttpResponseRedirect
from django.urls import reverse
from django.views import generic
from django.template import Context

from .forms import JSForm, ServerErrorForm, LastJSInvalidForm
from .models import PlaceHolderModel
#from deobfuscate.internal_test import MockClient
from deobfuscate.experiments import MosesClient

# Create your views here.
class IndexView(generic.ListView):
    #Display an about and link the actual text?
    template_name = 'deobfuscate/index.html'
    #context_object_name = 'javascript_deofuscation'
    def get_queryset(self):
        return JSForm()
    
def about(request):
    #output = "Behold, The Deobfuscated Javascript!"
    return render(request, 'deobfuscate/about.html')
    
def team(request):
    #output = "Behold, The Deobfuscated Javascript!"
    return render(request, 'deobfuscate/team.html')
     
    
def results(request, output):
    #output = "Behold, The Deobfuscated Javascript!"
    return render(request, 'deobfuscate/results.html', Context({'out_text': output}))
        
def get_js(request):
    # if this is a POST request we need to process the form data
    if request.method == 'POST':
        # create a form instance and populate it with data from the request:
        form = JSForm(request.POST)
        # check whether it's valid:
        if form.is_valid(): #(For performance, we don't want to rerun the beautifiers I think)
            # process the data in form.cleaned_data as required
            #View testing.
            #return render(request, 'deobfuscate/get_js.html', Context({'form': form, 'out_text': "Pull the lever!"}))
            rClient = MosesClient()
            #try:
            start = time.time()
            output = rClient.deobfuscateJS(form.cleaned_data['in_text'], 0) #Validate here.
            end = time.time()
            duration = end-start
            if(output in rClient.getValidationErrors()):
                form = LastJSInvalidForm()
                return render(request, "deobfuscate/get_js.html", {'form': form})
            elif(output == rClient.getServerError()):
                form = ServerErrorForm()
                #TODO: This should send an email alert to us that something has gone wrong.
                return render(request, "deobfuscate/get_js.html", {'form': form})
            else:
                # redirect to a new URL:
                return render(request, 'deobfuscate/get_js.html', Context({'form': form,'out_text': "Total Process Time: " + str(duration) + "\n" + output, 'height' : output.count("\n") + 1, 'width' : 80}))
                #return render(request, 'deobfuscate/results.html', Context({'out_text': "Total Process Time: " + str(duration) + "\n" + output, 'height' : output.count("\n") + 1, 'width' : 80}))
    # if a GET (or any other method) we'll create a blank form
    else:
        form = JSForm()
    #Replace with the form again.
    return render(request, "deobfuscate/get_js.html", Context({'form': form, 'out_text': "It's time to...", 'height' : 8}))
