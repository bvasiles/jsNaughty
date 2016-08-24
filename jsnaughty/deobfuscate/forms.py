from django import forms

class JSForm(forms.Form):
    #in_text = forms.Textarea(label = "Obfuscated Text")
    in_text = forms.CharField(widget=forms.Textarea)