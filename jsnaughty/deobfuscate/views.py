import time
from random import randint
from django.shortcuts import get_object_or_404, render
from django.http import HttpResponseRedirect
from django.urls import reverse
from django.views import generic
from django.template import Context

from .forms import JSForm, JSMinForm, JSMinErrorForm, ServerErrorForm, LastJSInvalidForm
from .models import PlaceHolderModel
#from deobfuscate.internal_test import MockClient
from deobfuscate.experiments import MosesClient
from deobfuscate.tools import Uglifier

# Create your views here.
class IndexView(generic.ListView):
    #Display an about and link the actual text?
    template_name = 'deobfuscate/index.html'
    #context_object_name = 'javascript_deofuscation'
    def get_queryset(self):
        return JSForm()
    
def phraseTables(request):
    return render(request, "deobfuscate/downloads.html")
    
def about(request):
    #output = "Behold, The Deobfuscated Javascript!"
    return render(request, 'deobfuscate/about.html')
    
def team(request):
    #output = "Behold, The Deobfuscated Javascript!"
    return render(request, 'deobfuscate/team.html')

def minify(request):
    if request.method == 'POST':
        print("Minifying")
        # create a form instance and populate it with data from the request:
        form = JSMinForm(request.POST)
        # check whether it's valid:
        if form.is_valid():
            normal_text = form.cleaned_data['in_text']
            uglify = Uglifier(flags=["-m"])
            #if(True):
            try:
                (ok, minified, msg) = uglify.web_run_end(normal_text)
                #print(minified)
                if(minified == ""):
                    raise ValueError
                return render(request, 'deobfuscate/minify.html', {'form': form,'out_text': minified, 'height' : minified.count("\n") + 1, 'width' : 80})

            except:
                print("Min fail.")
                form = JSMinErrorForm()
                return render(request, "deobfuscate/minify.html", {'form': form, 'out_text': "", 'height' : 8})
        else:
            print("Min valid fail.")
            form = JSMinErrorForm()
            return render(request, "deobfuscate/minify.html", {'form': form, 'out_text': "", 'height' : 8})
    else:
        form = JSMinForm()
    
    return render(request, "deobfuscate/minify.html", {'form': form, 'out_text': "", 'height' : 8})     
    
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
            rClient = MosesClient("./tmp/")
            #try:
            start = time.time()
            #TODO: 0 must be replaced with a proper number (random? sequence? -> shouldn't overlap 
            #for things near the same time...  But is it actually an issue?)
            #Yes, used for the JSNICE temp file.  That will be overwritten on
            #high loads before being called...  Talk to Bogdan about what is best solution.
            #What else should we time -> JSNICE time + Hash time, I think.
            if(form.cleaned_data['mix_jsnice'] == 'Y'):
                mix = True
            else:
                mix = False
            
            #Pick a number to give an id for where we are saving the JSNICE temp file if necessary
            transaction_id = randint(1, 1000000000)
            annotated_output = rClient.deobfuscateJS(form.cleaned_data['in_text'], mix, transaction_id, False) #Validate here.
            #Annotated output includes performance metrics.  We'll control how they are output here.
            #For now, just output deobsfucation + jsnice error string if necessary
            output = annotated_output[1] + annotated_output[0]
            
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
                #Context is giving an error for some reason.
                return render(request, 'deobfuscate/get_js.html', {'form': form,'out_text': output, 'height' : output.count("\n") + 1, 'width' : 80})
#                return render(request, 'deobfuscate/get_js.html', Context({'form': form,'out_text': "Total Process Time: " + str(duration) + "\n" + output, 'height' : output.count("\n") + 1, 'width' : 80}))
                #return render(request, 'deobfuscate/results.html', Context({'out_text': "Total Process Time: " + str(duration) + "\n" + output, 'height' : output.count("\n") + 1, 'width' : 80}))
    # if a GET (or any other method) we'll create a blank form
    else:
        form = JSForm()
    #Replace with the form again.
    return render(request, "deobfuscate/get_js.html", {'form': form, 'out_text': "", 'height' : 8})
