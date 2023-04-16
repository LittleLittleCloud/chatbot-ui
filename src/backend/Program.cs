// Copyright (c) Microsoft. All rights reserved.

using Azure.AI.OpenAI;
using Azure.Identity;
using Azure.Search.Documents;
using Azure.Storage.Blobs;
using Backend.Services;
using Microsoft.SemanticKernel;
using Microsoft.SemanticKernel.AI.TextCompletion;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

// Add swagger if in development mode
if(builder.Environment.IsDevelopment())
{
    // See: https://aka.ms/aspnetcore/swashbuckle
    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddSwaggerGen();
}


var azureCredential = new DefaultAzureCredential();
var azureStorageAccount = builder.Configuration["AZURE_STORAGE_ACCOUNT"];

// Add blob service client
var blobServiceClient = new BlobServiceClient(new Uri($"https://{azureStorageAccount}.blob.core.windows.net"), azureCredential);
builder.Services.AddSingleton(blobServiceClient);

// Add blob container client
var azureStorageContainer = builder.Configuration["AZURE_STORAGE_CONTAINER"];
var blobContainerClient = blobServiceClient.GetBlobContainerClient(azureStorageContainer);
builder.Services.AddSingleton(blobContainerClient);

// add semantic kernel
var azureOpenaiDavinciDeployment = builder.Configuration["AZURE_OPENAI_GPT_DEPLOYMENT"];
var azureOpenaiService = builder.Configuration["AZURE_OPENAI_SERVICE"];
var openAIClient = new OpenAIClient(new Uri($"https://{azureOpenaiService}.openai.azure.com"), azureCredential);

// Semantic Kernel doesn't support Azure AAD credential for now
// so we implement our own text completion backend
var azureOpenAIDavinciService = new AzureOpenAITextCompletionService(openAIClient, azureOpenaiDavinciDeployment);
var textCompletionFactory = new Dictionary<string, ITextCompletion>()
{
    { azureOpenaiDavinciDeployment, azureOpenAIDavinciService },
};

builder.Services.AddSingleton(textCompletionFactory);

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();
app.UseDefaultFiles();
app.UseStaticFiles();

app.Run();
