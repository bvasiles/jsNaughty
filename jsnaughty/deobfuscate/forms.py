from django import forms

class JSForm(forms.Form):
    #in_text = forms.Textarea(label = "Obfuscated Text")
    #in_text = forms.CharField(widget=forms.Textarea)
    in_text = forms.CharField(widget=forms.Textarea, initial = "Enter your Javascript Here.")
    
class LastJSInvalidForm(forms.Form):
    '''
    Used as alternate form for when the past Javascript entered failed
    the pre or post processing.
    '''
    in_text = forms.CharField(widget=forms.Textarea, initial = '(Error) Please enter valid javascript.')
    
class ServerErrorForm(forms.Form):
    '''
    Used as alternate form for when the moses server is offline or 
    otherwise failed.
    '''
    in_text = forms.CharField(widget=forms.Textarea, initial = '(Error) Sorry, internal server is either offline or not functioning.')